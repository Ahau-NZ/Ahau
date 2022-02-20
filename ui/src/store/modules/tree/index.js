import * as d3 from 'd3'
import groupBy from 'lodash.groupby'

import settings from '../../../lib/link'

export default function () {
  const nodeSeparationX = 150
  const nodeSeparationY = 200

  const state = {
    mouseEvent: null
  }

  // we need to know the x/y of each drawn profile (d3 nodes + partners),
  // so I think we should calculate all positions here
  // this means we can more easily draw lessImortantRelationship links

  const getters = {
    mouseEvent: state => state.mouseEvent,
    countVisiblePartners: (state, getters, rootState, rootGetters) => (node) => {
      return rootGetters['whakapapa/getPartnerIds'](node.data.id).length
    },
    distanceBetweenNodes: (state, getters) => (nodeA, nodeB, areCousins) => {
      const { countVisiblePartners } = getters

      let combinedPartners = countVisiblePartners(nodeA) + countVisiblePartners(nodeB)

      if (areCousins) {
        combinedPartners += 0.5 * (
          countVisiblePartners(nodeA.parent) +
          countVisiblePartners(nodeB.parent)
        )
      }

      return 1 + (0.5 * combinedPartners)
    },
    layout (state, getters) {
      return d3
        .tree()
        .nodeSize([
          nodeSeparationX,
          nodeSeparationY
        ])
        .separation((a, b) => {
          return (a.parent === b.parent)
            ? getters.distanceBetweenNodes(b, a) // siblings (left=B, right=A)
            : getters.distanceBetweenNodes(a, b, true) // areCousins (left=A, right=B)
        })
    },
    root (state, getters, rootState, rootGetters) {
      const nestedWhakapapa = rootGetters['whakapapa/nestedWhakapapa']
      if (!nestedWhakapapa) return

      return d3.hierarchy(nestedWhakapapa)
    },
    tree (state, getters) {
      const root = getters.root
      if (!root) return

      return getters.layout(getters.root)
    },
    // TODO determind if root, tree, descendants needed
    descendants (state, getters) {
      const tree = getters.tree
      if (!tree) return []

      return tree
        .descendants()
        // returns the array of descendants starting with the root node, then followed by each child in topological order
    },

    // nodes
    getNode: (state, getters) => (id) => {
      return getters.descendants.find(node => node && node.data.id === id)
    },
    getParentNodeId: (state, getters) => (id) => {
      const node = getters.getNode(id)

      if (!node || !node.parent || !node.parent.data) return null
      return node.parent.data.id
    },

    // linkNodes
    secondaryLinks (state, getters, rootState, rootGetters) {
      const linksByChild = groupBy(rootGetters['whakapapa/secondaryLinks'], 'child')

      return Object.entries(linksByChild).reduce(
        (acc, [childId, childLinks]) => {
          const childNode = getters.getNode(childId)
          // TODO may need to check partners
          if (!childNode) {
            console.log('cannot find childNode', childId)
            return acc
          }
          // const seenParents = new Set()

          // TODO come back to find midpoints of parents who are partners
          childLinks.forEach(childLink => {
            const parentNode = getters.getNode(childLink.parent) // TODO may need to check partners
            if (!parentNode) {
              console.log('cannot find parentNode', childLink.parent)
              return
            }

            acc.push(buildLink(parentNode, childNode, childLink.relationshipType))
          })

          return acc
        },
        []
      )

      // find the childNode in the graph (could be a partner)
      // find the "parentNode" in the graph (could be the midpoint between partners, check the links!)
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

const LINK_OFFSET = 10
function buildLink (fromNode, toNode, relationshipType) {
  const isDashed = relationshipType && relationshipType !== 'birth' && relationshipType !== 'partner'

  const coords = {
    startX: fromNode.x + (fromNode.radius || 50),
    startY: fromNode.y + (fromNode.radius || 50),
    endX: toNode.x + (toNode.radius || 50),
    endY: toNode.y + (toNode.radius || 50)
  }
  // NOTE we wouldn't need radius if all avatars were drawn centered

  if (relationshipType === 'partner') {
    coords.directed = false
  }

  const offset = (coords.startX < coords.endX) ? LINK_OFFSET : -1 * LINK_OFFSET
  if (fromNode.children && fromNode.children.length) coords.startX += offset
  coords.endX -= offset

  return {
    id: ['secondary', fromNode.data.id, toNode.data.id].join('-'),
    style: {
      fill: 'none',
      // stroke: settings.color.getColor(0),
      stroke: '#f0f',
      opacity: settings.opacity,
      strokeWidth: settings.thickness,
      strokeLinejoin: 'round',
      strokeDasharray: isDashed ? 2.5 : 0
    },
    d: settings.path(coords)
  }
}
