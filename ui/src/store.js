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

/*
  searches through the nestedWhakapap to find
  the profile by id and updates their personal
  details but not their children
*/
function updateNode (nestedWhakapapa, node) {
  // if the nestedWhakapapa has no value
  // then we can search it
  if (!nestedWhakapapa) return null

  // if the nestedWhakapapa matches the node we are
  // looking for, then look no further
  if (nestedWhakapapa.id === node.id) {
    // update its value
    nestedWhakapapa = node
    return nestedWhakapapa
  }

  // if this nestedWhakapap isnt the one we are looking for,
  // try searching its children
  nestedWhakapapa.children = nestedWhakapapa.children.map(child => {
    // do the same for each child
    return updateNode(child, node) // will either return a changed value or the same one
  })

  return nestedWhakapapa
}

/*
  searches through the nestedWhakapapa to find
  the profile by id and removes them and all their decendants
*/
function deleteNode (nestedWhakapapa, id) {
  // if the nestedWhakapapa has no value
  // then we can search it
  if (!nestedWhakapapa) return null

  // if the nestedWhakapapa matches the id we are
  // looking for, then look no further
  if (nestedWhakapapa.id === id) {
    // found the node we need to delete
    // so returning null will set its value to null
    return null
  }

  // if this nestedWhakapap isnt the one we are looking for,
  // try searching its children

  var childIndex = -1

  nestedWhakapapa.children.some((child, i) => {
    var node = deleteNode(child, id)
    console.log('node', node)
    if (node === null) {
      childIndex = i
      return true
    }
  })

  // if an index was set
  if (childIndex > -1) {
    // remove that child
    nestedWhakapapa.children.splice(childIndex, 1)
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
