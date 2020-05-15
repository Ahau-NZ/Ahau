// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

const state = {
  activeComponent: 'profile'
}

const getters = {
  activeComponent: state => {
    return state.activeComponent
  }
}

const mutations = {
  updateComponent (state, component) {
    state.activeComponent = component
  }
}

const actions = {
  setComponent ({ commit }, component) {
    commit('updateComponent', component)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
