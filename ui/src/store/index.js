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
    loading: false
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
    }
  },
  mutations: {
    updateLoading (state, loading) {
      state.loading = loading
    },
    updateWhoami (state, whoami) {
      state.whoami = whoami
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
    }
  }
})

export default store
