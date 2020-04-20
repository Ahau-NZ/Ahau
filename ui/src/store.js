import Vue from 'vue'
import Vuex from 'vuex'

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
    updateNestedWhakapapa ({ state, commit }, node) {
      const whakapapa = update(state.nestedWhakapapa, node)
      commit('setNestedWhakapapa', whakapapa)
    }
  }
})

function update (nestedWhakapapa, node) {
  if (!nestedWhakapapa) return null
  if (nestedWhakapapa.id === node.id) {
    console.log('found')
    console.log('nestedWhakapapa', nestedWhakapapa)
    console.log('node', node)
    nestedWhakapapa = node
    return nestedWhakapapa
  }

  nestedWhakapapa.children = nestedWhakapapa.children.map(child => {
    var found = update(child, node)
    if (found) return found

    return child
  })

  return nestedWhakapapa
}
