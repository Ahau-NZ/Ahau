// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'
/*
  this is needed in order to run queries and mutations
  TODO: is this okay?
*/
// const apolloProvider = createProvider()
// const apolloClient = apolloProvider.defaultClient

/*
  holds current value of the artefact state
*/
const state = {
  selectedProfile: {}
}

/*
  these map getters to whats in the state, then we can use those getters
  within components
*/
const getters = {
  selectedProfile: state => {
    return state.selectedProfile
  }
}

/*
  These are what makes changes to the state
*/
const mutations = {
  updateProfile (state, profile) {
    state.selectedProfile = profile
  }
}

/*
  These do not like directly change the state, but they commit mutations (changes),
  which make changes to the state
*/
const actions = {
  async setProfile ({ commit }, profile) {
    commit('updateProfile', profile)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
