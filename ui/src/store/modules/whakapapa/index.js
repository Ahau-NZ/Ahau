import tree from '@/lib/tree-helpers'

const state = {
  nestedWhakapapa: {},
  whakapapa: {}
}

const getters = {
  nestedWhakapapa: state => {
    return state.nestedWhakapapa
  },
  whakapapa: state => {
    return state.whakapapa
  }
}

const mutations = {
  setNestedWhakapapa (state, nestedWhakapapa) {
    state.nestedWhakapapa = nestedWhakapapa
  },
  setWhakapapa (state, whakapapa) {
    state.whakapapa = whakapapa
  },
  updatePartnerInNestedWhakapapa (state, node) {
    state.nestedWhakapapa = tree.updatePartner(state.nestedWhakapapa, node)
  },
  updateNodeInNestedWhakapapa (state, node) {
    state.nestedWhakapapa = tree.updateNode(state.nestedWhakapapa, node)
  },
  deleteNodeInNestedWhakapapa (state, node) {
    var whakapapa = {}

    if (node.isPartner) {
      whakapapa = tree.deletePartnerNode(state.nestedWhakapapa, node.id)
    } else {
      whakapapa = tree.deleteNode(state.nestedWhakapapa, node.id)
    }

    state.nestedWhakapapa = whakapapa
  },
  addChildToNestedWhakapapa (state, { child, parent }) {
    var whakapapa = {}

    if (parent.isPartner) {
      whakapapa = tree.addChildToPartner(state.nestedWhakapapa, child, parent)
    } else {
      whakapapa = tree.addChild(state.nestedWhakapapa, child, parent)
    }

    state.nestedWhakapapa = whakapapa
  },
  addParentToNestedWhakapapa (state, { child, parent }) {
    state.nestedWhakapapa = tree.addParent(state.nestedWhakapapa, child, parent)
  },
  addPartnerToNestedWhakapapa (state, { node, partner }) {
    state.nestedWhakapapa = tree.addPartner(state.nestedWhakapapa, node, partner)
  }
}

const actions = {
}

export default {
  state,
  mutations,
  actions,
  getters
}
