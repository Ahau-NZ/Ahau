import * as d3 from 'd3'

import {
  layoutPartnerNodes,
  layoutPartnerLinks,
  layoutChildLinks,
  layoutSecondaryLinks
} from './lib'

import { NODE_SIZE_X, NODE_SIZE_Y, RADIUS, PARTNER_RADIUS, PARTNER_SPACE, SIBLING_SPACE } from './constants'

export default function () {
  const state = {
    mouseEvent: null
  }

  // we need to know the x/y of each drawn profile (d3 nodes + partners),
  // so I think we should calculate all positions here
  // this means we can more easily draw lessImortantRelationship links

  const getters = {
    mouseEvent: state => state.mouseEvent,

    countPartners: (state, getters, rootState, rootGetters) => (node) => {
      return rootGetters['whakapapa/getPartnerIds'](node.data.id).length
    },
    distanceBetweenNodes: (state, getters) => (nodeA, nodeB) => {
      // horizontal distance between node centers (as a multuple of NODE_SIZE_X)
      const { countPartners } = getters

      const combinedPartners = countPartners(nodeA) + countPartners(nodeB)

      if (nodeA.parent === nodeB.parent) { // nodes are siblings
        return (
          RADIUS +
          (Math.ceil(combinedPartners / 2) * (PARTNER_SPACE + 2 * PARTNER_RADIUS)) +
          SIBLING_SPACE +
          RADIUS
        ) / NODE_SIZE_X
        // a cheaper approximation:
        // return 1 + combinedPartners / 2
      }

      // NOTE - could be cousins
      // (i.e. nodeA.parent.parent === nodeB.parent.parent), but not necessarily
      const parentsCombinedPartners = countPartners(nodeA.parent) + countPartners(nodeB.parent)
      return 1 + combinedPartners / 2 + parentsCombinedPartners / 4
    },

    layout (state, getters) {
      return d3.tree()
        .nodeSize([NODE_SIZE_X, NODE_SIZE_Y])
        .separation((a, b) => {
          return (a.parent === b.parent)
            ? getters.distanceBetweenNodes(b, a) // siblings (left=B, right=A)
            : getters.distanceBetweenNodes(a, b, true) // areCousins (left=A, right=B)
        })
    },

    root (state, getters, rootState, rootGetters) {
      const nestedWhakapapa = rootGetters['whakapapa/nestedWhakapapa']
      return d3.hierarchy(nestedWhakapapa)
        // sort the children by birthOrder! - see https://github.com/d3/d3-hierarchy#node_sort
        .sort((a, b) => (
          getBirthOrder(rootGetters['person/person'](a.id)) -
          getBirthOrder(rootGetters['person/person'](b.id))
          // NOTE we could also sort by birthDate...
          // TODO smoke test this
        ))
        // calculate the total number of nodes in each SubTree (cummulatively)
        // so looking at the top SubTree node tells you how many nodes in the graph
        // stored in rootNode.data.value
        .sum(nodeData => {
          return 1 + rootGetters['whakapapa/getPartnerIds'](nodeData.id).length
        })
    },

    tree (state, getters, rootState, rootGetters) {
      const treeLayout = getters.layout(getters.root)

      // for each node in the tree:
      treeLayout.each(node => {
        // add partners (sorted by children)
        node.partners = layoutPartnerNodes(node, rootGetters)

        // then add link data
        //    - rootNode --> partner (if there's a relationship)
        //    - rootNode --> child (when solo parent)
        //    - partner --> child (when solo parent)
        //    - rootNode + partner --> child

        node.links = [
          ...layoutChildLinks(node, rootGetters),
          ...layoutPartnerLinks(node, rootGetters)
        ]
      })

      // treeLayout.secondaryLinks = layoutSecondaryLinks(getters, rootGetters)
      // NOTE ideally we could do this here ... but results in an infinite loop
      // NOTE done after above round as partners are added there

      return treeLayout
    },
    descendants (state, getters) {
      return getters.tree.descendants()
      // returns the array of descendants starting with the root node, then followed by each child in topological order
    },

    // nodes
    getNode: (state, getters) => (id) => {
      return getters.descendants.find(node => node && node.data.id === id)
    },
    getPartnerNode: (state, getters) => (id) => {
      const rootNode = getters.descendants.find(node => node.partners.some(partner => partner.data.id === id))
      if (!rootNode) return

      return rootNode.partners.find(partner => partner.data.id === id)
    },
    getParentNodeId: (state, getters) => (id) => {
      const node = getters.getNode(id)

      if (!node || !node.parent || !node.parent.data) return null
      return node.parent.data.id
    },

    secondaryLinks (state, getters, rootState, rootGetters) {
      return layoutSecondaryLinks(getters, rootGetters)
    }
  }

  const mutations = {
    setMouseEvent (state, e) {
      state.mouseEvent = e
    }
  }

  const actions = {
    setMouseEvent ({ commit }, e) {
      commit('setMouseEvent', e)
    }
  }

  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
  }
}

function getBirthOrder (profile) {
  if (!profile || profile.birthOrder == null) return undefined // sorts to end
  return profile.birthOrder
}
