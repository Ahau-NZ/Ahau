import tree from '@/lib/tree-helpers'

const actions = {
  updatePartnerNode ({ state, commit }, node) {
    const whakapapa = tree.updatePartnerNode(state.nestedWhakapapa, node)
    commit('setNestedWhakapapa', whakapapa)
  },
  updateNode ({ state, commit }, { node, path }) {
    console.log('store whakapapa module')
    var whakapapa = tree.updateNode(state.nestedWhakapapa, node)
    commit('setNestedWhakapapa', whakapapa)
  },
  deleteNode ({ state, commit }, profile) {
    var whakapapa = {}
    if (profile.isPartner) {
      whakapapa = tree.deletePartnerNode(state.nestedWhakapapa, profile.id)
    } else {
      whakapapa = tree.deleteNode(state.nestedWhakapapa, profile.id)
    }
    commit('setNestedWhakapapa', whakapapa)
  },
  addChild ({ state, commit }, { child, parent }) {
    var whakapapa = {}
    if (parent.isPartner) {
      whakapapa = tree.addChildToPartner(state.nestedWhakapapa, child, parent)
    } else {
      whakapapa = tree.addChild(state.nestedWhakapapa, child, parent)
    }
    commit('setNestedWhakapapa', whakapapa)
  },
  addParent ({ state, commit }, { child, parent }) {
    var whakapapa = {}
    whakapapa = tree.addParent(state.nestedWhakapapa, child, parent)
    commit('setNestedWhakapapa', whakapapa)
  },
  setWhakapapa ({ commit }, whakapapa) {
    commit('setNestedWhakapapa', whakapapa)
  }
}

export default actions
