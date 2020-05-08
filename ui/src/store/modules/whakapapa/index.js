// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'
// import actions from './actions'
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
  }
}

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
  addNestedWhakapapa ({ commit }, whakapapa) {
    commit('setNestedWhakapapa', whakapapa)
  },
  addWhakapapa ({ commit }, whakapapa) {
    commit('setWhakapapa', whakapapa)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
