import Vue from 'vue'
import Vuex from 'vuex'
// import set from 'lodash.set'
import tree from '@/lib/tree-helpers'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nestedWhakapapa: {},
    loading: false
  },
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
      if (child.isPartner) {
        console.error('addParentToPartner hasnt been implemented yet')
      } else {
        whakapapa = tree.addParent(state.nestedWhakapapa, child, parent)
      }
      commit('setNestedWhakapapa', whakapapa)
    },
    loading ({ commit }, loading) {
      commit('setLoading', loading)
    }
  }
})
