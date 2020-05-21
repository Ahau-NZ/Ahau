import Vue from 'vue'
import Vuex from 'vuex'
import { createProvider } from '../plugins/vue-apollo'
import gql from 'graphql-tag'

import whakapapa from './modules/whakapapa'
import person from './modules/person'
import archive from './modules/archive'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    whoami: {},
    loading: false,
    goBack: {
      show: false,
      location: ''
    },
    dialog: {
      active: '',
      type: ''
    }
  },
  modules: {
    whakapapa,
    person,
    archive
  },
  getters: {
    loadingState: state => {
      return state.loading
    },
    whoami: state => {
      return state.whoami
    },
    route: state => {
      return state.route
    },
    // TODO-implement goBack to previous profile &| component
    goBack: state => {
      return state.goBack
    }
  },
  mutations: {
    updateLoading (state, loading) {
      state.loading = loading
    },
    updateWhoami (state, whoami) {
      state.whoami = whoami
    },
    updateGoBack (state, go) {
      state.goBack = go
    }
  },
  actions: {
    setLoading ({ commit }, loading) {
      commit('updateLoading', loading)
    },
    async setWhoami ({ commit }) {
      const result = await apolloClient.query({
        query: gql`
          {
            whoami {
              profile {
                id
                preferredName
                bornAt 
                gender 
                avatarImage { uri }
              }
              feedId
            }
          }
        `,
        fetchPolicy: 'no-cache'
      })

      if (result.errors) throw result.errors

      commit('updateWhoami', result.data.whoami)
    },
    goBack ({ commit }, go) {
      commit('updateGoBack', go)
    }
  }
})

export default store
