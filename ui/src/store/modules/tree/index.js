import * as d3 from 'd3'

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
    tree: (state, getters) => {
      const root = getters.root
      if (!root) return

      return getters.layout(getters.root)
    },
    // TODO only descendants used - merge in root, tree
    descendants (state, getters) {
      const tree = getters.tree
      if (!tree) return []

      return tree
        .descendants()
        // returns the array of descendants starting with the root node, then followed by each child in topological order
    },
    mouseEvent: state => state.mouseEvent,

    // nodes
    getNode: (state, getters) => (id) => {
      return getters.descendants.find(node => node && node.data.id === id)
    },
    getParentNodeId: (state, getters) => (id) => {
      const node = getters.getNode(id)

      if (!node || !node.parent || !node.parent.data) return null
      return node.parent.data.id
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
