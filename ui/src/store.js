import Vue from 'vue'
import Vuex from 'vuex'
// import set from 'lodash.set'
import tree from '@/lib/tree-helpers'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    nestedWhakapapa: {}
  },
  getters: {
    nestedWhakapapa: state => {
      return state.nestedWhakapapa
    }
  },
  mutations: {
    setNestedWhakapapa (state, nestedWhakapapa) {
      console.log('nestedWhakapapa', nestedWhakapapa)
      state.nestedWhakapapa = nestedWhakapapa
    }
  },
  actions: {
    updatePartnerNode ({ state, commit }, node) {
      console.log('updatePartnerNode')
      const whakapapa = tree.updatePartnerNode(state.nestedWhakapapa, node)
      commit('setNestedWhakapapa', whakapapa)
    },
    updateNode ({ state, commit }, { node, path }) {
      // var whakapapa
      // if (path) {
      // const whakapapa = set(state.nestedWhakapapa, path, node)
      // } else {
      //  console.log('no path')
      var whakapapa = tree.updateNode(state.nestedWhakapapa, node)
      // }
      commit('setNestedWhakapapa', whakapapa)
    },
    deleteNode ({ state, commit }, profile) {
      var whakapapa = {}
      if (profile.isPartner) {
        console.error('deletePartnerNode not implemented')
      } else {
        whakapapa = tree.deleteNode(state.nestedWhakapapa, profile.id)
      }
      commit('setNestedWhakapapa', whakapapa)
    },
    addChild ({ state, commit }, { child, parent }) {
      console.log('addChild')
      var whakapapa = {}
      if (parent.isPartner) {
        whakapapa = tree.addChildToPartner(state.nestedWhakapapa, child, parent)
      } else {
        whakapapa = tree.addChild(state.nestedWhakapapa, child, parent)
      }
      commit('setNestedWhakapapa', whakapapa)
    },
    addParent ({ state, commit }, { child, parent }) {
      console.log('addParent')
      var whakapapa = {}
      if (child.isPartner) {
        console.error('addParentToPartner hasnt been implemented yet')
      } else {
        whakapapa = tree.addParent(state.nestedWhakapapa, child, parent)
      }
      commit('setNestedWhakapapa', whakapapa)
    }
  }
})
