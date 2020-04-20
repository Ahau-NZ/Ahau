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
    updateNode ({ state, commit }, node) {
      const whakapapa = updateNode(state.nestedWhakapapa, node)
      commit('setNestedWhakapapa', whakapapa)
    },
    deleteNode ({ state, commit }, id) {
      const whakapapa = deleteNode(state.nestedWhakapapa, id)
      console.log(whakapapa)

      //commit('setNestedWhakapapa', whakapapa)
    }
  }
})

function updateNode (nestedWhakapapa, node) {
  if (!nestedWhakapapa) return null
  if (nestedWhakapapa.id === node.id) {
    nestedWhakapapa = node
    return nestedWhakapapa
  }

  nestedWhakapapa.children = nestedWhakapapa.children.map(child => {
    var found = updateNode(child, node)
    if (found) return found

    return child
  })

  return nestedWhakapapa
}

function deleteNode (nestedWhakapapa, id) {
  if (!nestedWhakapapa) return null
  if (nestedWhakapapa.id === id) {
    // found the node we need to delete
    return null
  }

  var childToDelete = null

  nestedWhakapapa.children.some((child, i) => {
    var node = deleteNode(child, id)
    if (!node) {
      childToDelete = i
      return true
    }
  })

  if (childToDelete) {
    nestedWhakapapa.children.splice(childToDelete, 1)
  }

  return nestedWhakapapa
}

// function find (nestedWhakapapa, id) {
//   if (!nestedWhakapapa) return null
//   if (nestedWhakapapa.id === node.id) {
//     nestedWhakapapa = node
//     return nestedWhakapapa
//   }

//   nestedWhakapapa.children = nestedWhakapapa.children.map(child => {
//     var found = update(child, node)
//     if (found) return found

//     return child
//   })

//   return nestedWhakapapa
// }
