import Vue from 'vue'
import Vuex from 'vuex'
import { createProvider } from '../plugins/vue-apollo'
import gql from 'graphql-tag'
import { whoami } from '@/lib/profile-helpers'


import whakapapa from './modules/whakapapa'
import person from './modules/person'
import archive from './modules/archive'
import dialog from './modules/dialog'

const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    whoami: {
      profile: {
        id: '',
        preferredName: '',
        aliveInterval: '',
        avatarImage: { uri: '' }
      },
      feedId: ''
    },
    loading: false,
    goBack: {
      show: false,
      location: ''
    }
  },
  modules: {
    whakapapa,
    person,
    archive,
    dialog
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
      const result = await apollo.query({
        query: gql`
          {
            whoami {
              profile {
                id
                preferredName
                aliveInterval
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
