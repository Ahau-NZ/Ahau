import Vue from 'vue'
import Vuex from 'vuex'
import tree from '@/lib/tree-helpers'
import { createProvider } from '../plugins/vue-apollo'

// import whakapapa from './modules/whakapapa'
// import profile from './modules/whakapapa'
// import archive from './modules/whakapapa'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    value: 0,
    nestedWhakapapa: {},
    loading: false
  },
  // modules: {
  //   whakapapa
  // },
  getters: {
    nestedWhakapapa: state => {
      return state.nestedWhakapapa
    },
    loadingState: state => {
      return state.loading
    }
  },
  mutations: {
    setNestedWhakapapa (state, nestedWhakapapa) {
      state.nestedWhakapapa = nestedWhakapapa
    },
    setLoading (state, loading) {
      state.loading = loading
    }
  },
  actions: {
    updatePartnerNode ({ state, commit }, node) {
      const whakapapa = tree.updatePartnerNode(state.nestedWhakapapa, node)
      commit('setNestedWhakapapa', whakapapa)
    },
    updateNode ({ state, commit }, { node, path }) {
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
    loading ({ commit }, loading) {
      commit('setLoading', loading)
    }
  },
  apolloProvider: createProvider()
})

export default store
