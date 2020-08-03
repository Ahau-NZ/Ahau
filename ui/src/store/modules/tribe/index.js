// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

const state = {
  currentTribe: {}
}

const getters = {
  currentTribe: state => {
    return state.currentTribe
  }
}

const mutations = {
  updateCurrentTribe (state, tribe) {
    state.currentTribe = tribe
  }
}

const actions = {
  setCurrentTribe ({ commit }, tribe) {
    commit('updateCurrentTribe', tribe)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
