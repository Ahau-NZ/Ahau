/* eslint brace-style: ["error", "stroustrup", { "allowSingleLine": true }] */

import {
  tree as d3Tree,
  hierarchy as d3Hierarchy
} from 'd3'

import {
  layoutPartnerNodes,
  layoutPartnerLinks,
  layoutChildLinks,
  layoutSecondaryLinks
} from './lib'

import { NODE_SIZE_X, NODE_SIZE_Y, RADIUS, PARTNER_RADIUS, PARTNER_SPACE, SIBLING_SPACE, COUSIN_SPACE } from './constants'
import calculateAge from '../../../lib/calculate-age'

export default function () {
  const state = {
    tree: null,
    secondaryLinks: {},
    mouseEvent: null,
    hoveredProfileId: null,
    searchedProfileId: null
  }

  // we need to know the x/y of each drawn profile (d3 nodes + partners),
  // so I think we should calculate all positions here
  // this means we can more easily draw lessImortantRelationship links

  const getters = {
    tree: state => state.tree,
    descendants (state, getters) {
      if (state.tree) return state.tree.descendants()
      else return []
      // returns the array of descendants starting with the root node, then followed by each child in topological order
    },
    mouseEvent: state => state.mouseEvent,
    hoveredProfileId: state => state.hoveredProfileId,
    searchedProfileId: state => state.searchedProfileId,
    countPartners: (state, getters, rootState, rootGetters) => (node) => {
      return rootGetters['whakapapa/getPartnerIds'](node.data.id).length
    },
    partnerSidesCount: (state, getters) => (nodeId) => {
      // calculate how many left/ right
      // ??!!
    },
    countPartnersBetween: (state, getters) => (nodeA, nodeB) => {
      // calculate the partner placement for each Node,
      // then count the partners "between"
      //
      //        (A)-p-p         p-(B)-p-p-p   : 3 partners between
      //
      const partnersA = getters.partnerSidesCount(nodeA)
      // { left: 0, right: 2 }
      const partnersB = getters.partnerSidesCount(nodeA)
      // { left: 0, right: 2 }

      if (nodeA.x <= nodeB.x) {
        return partnersA.right + partnersB.left
      }
      else {
        return partnersB.right + partnersA.left
      }
    },
    distanceBetweenNodes: (state, getters) => (nodeA, nodeB) => {
      // horizontal distance between node centers (as a multuple of NODE_SIZE_X)

      const partnersBetween = getters.countPartnersBetween(nodeA, nodeB)

      /* if nodes are siblings */
      if (nodeA.parent === nodeB.parent) {
        return (
          RADIUS +
          (partnersBetween * (PARTNER_SPACE + 2 * PARTNER_RADIUS)) +
          SIBLING_SPACE +
          RADIUS
        ) / NODE_SIZE_X
      }
      /* if nodes are more distant */
      else {
        return (
          RADIUS +
          (partnersBetween * (PARTNER_SPACE + 2 * PARTNER_RADIUS)) +
          COUSIN_SPACE + // <<< this is bigger than sibling spacing
          RADIUS
        ) / NODE_SIZE_X
      }
    },
    layout (state, getters) {
      return d3Tree()
        .nodeSize([NODE_SIZE_X, NODE_SIZE_Y])
        .separation((a, b) => {
          return (a.parent === b.parent)
            ? getters.distanceBetweenNodes(b, a) // siblings (left=B, right=A)
            : getters.distanceBetweenNodes(a, b, true) // areCousins (left=A, right=B)
        })
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
    },
    // if there is a node for the profile, then it means it is in the drawn tree
    // NOTE: the collapsed nodes are not in the drawn tree!
    isInTree: (state, getters) => (id) => {
      return Boolean(
        getters.getNode(id) ||
        getters.getPartnerNode(id)
      )
    }
  }

  const mutations = {
    setMouseEvent (state, e) {
      state.mouseEvent = e
    },
    setHoveredProfileId (state, id) {
      state.hoveredProfileId = id
    },
    setSearchedProfileId (state, id) {
      state.searchedProfileId = id
    },
    setTree (state, tree) {
      state.tree = tree
    }
  }

  const actions = {
    setMouseEvent ({ commit }, e) {
      commit('setMouseEvent', e)
    },
    setHoveredProfileId ({ commit }, id) {
      commit('setHoveredProfileId', id)
    },
    setSearchedProfileId ({ commit }, id) {
      commit('setSearchedProfileId', id)
    },
    refreshWhakapapaData ({ rootGetters, commit }) {
      const tree = buildTree(rootGetters)

      commit('setTree', tree)
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

export function buildTree (rootGetters) {
  const root = buildRoot(rootGetters)
  const treeLayout = rootGetters['tree/layout'](root)

  const getChildType = (parentNode, childNode) => {
    return rootGetters['whakapapa/getChildType'](parentNode.data.id, childNode.data.id)
  }
  const getPartnerType = (A, B) => {
    return rootGetters['whakapapa/getPartnerType'](A.data.id, B.data.id)
  }

  // for each node in the tree:
  treeLayout.each(node => {
    // add partners (sorted by children)
    node.partners = layoutPartnerNodes(node, rootGetters)

    // then add link data
    //    - rootNode --> partner (if there's a relationship)
    //    - rootNode --> child (when solo parent)
    //    - partner --> child (when solo parent)
    //    - rootNode + partner --> child
    const partnerLinks = layoutPartnerLinks(node, { getPartnerType })
    const childLinks = layoutChildLinks(node, partnerLinks, { getChildType, getPartnerType })

    node.links = [
      ...childLinks,
      ...partnerLinks
    ]
  })

  // treeLayout.secondaryLinks = layoutSecondaryLinks(getters, rootGetters)
  // NOTE ideally we could do this here ... but results in an infinite loop
  // NOTE done after above round as partners are added there

  return treeLayout
}

function buildRoot (rootGetters) {
  const nestedDescendants = rootGetters['whakapapa/nestedDescendants']

  return d3Hierarchy(nestedDescendants)
    /* sort the children by age */
    .sort(CompareAge(rootGetters))
    // https://github.com/d3/d3-hierarchy#node_sort
}

function CompareAge (rootGetters) {
  return function compareAge (a, b) {
    const A = getOrderData(rootGetters, a)
    if (!A) return 0
    const B = getOrderData(rootGetters, b)
    if (!B) return 0

    return _compareAge(A, B)
  }
}

export function _compareAge (A, B) {
  // if the birth order is set for both use that
  if (A.birthOrder > B.birthOrder) return 1
  if (A.birthOrder < B.birthOrder) return -1

  // if the birth order is only set for one of them it goes first
  if (A.birthOrder !== undefined && B.birthOrder === undefined) return -1
  if (A.birthOrder === undefined && B.birthOrder !== undefined) return 1

  // if there is no birth order set and both have a dob order by dob
  if (A.age > B.age) return -1
  if (A.age < B.age) return 1

  return 0
}

function getOrderData (rootGetters, node) {
  const profile = rootGetters['person/person'](node.data.id)
  if (!profile) return
  return {
    age: profile.aliveInterval && calculateAge(profile.aliveInterval),
    birthOrder: profile.birthOrder || undefined
    // NOTE cannot leave null, as e.g. null < 4 === true
  }
}
