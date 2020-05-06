import Vue from 'vue'
import Vuex from 'vuex'
// import tree from '@/lib/tree-helpers'
import { createProvider } from '../plugins/vue-apollo'
import gql from 'graphql-tag'

import whakapapa from './modules/whakapapa'
import person from './modules/person'
// import archive from './modules/whakapapa'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    whoami: {},
    // value: 0,
    // selectedProfile: {},
    loading: false
    // isMobile: false
  },
  modules: {
    whakapapa,
    person
  },
  getters: {
    loadingState: state => {
      return state.loading
    },
    whoami: state => {
      return state.whoami
    }
    // mobile: state => {
    //   return state.mobile
    // }
  },
  mutations: {
    updateLoading (state, loading) {
      state.loading = loading
    },
    updateWhoami (state, whoami) {
      state.whoami = whoami
    }
    // setIsMobile (state, mobile) {
    //   state.isMobile = mobile
    // }
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
    // mobile ({ commit }, mobile) {
    //   commit('setIsMobile', mobile)
    // }
  }
})

export default store
