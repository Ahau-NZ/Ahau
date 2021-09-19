import Vue from 'vue'
import Vuex from 'vuex'

import { whoami } from '../lib/person-helpers.js'

import whakapapa from './modules/whakapapa'
import person from './modules/person'
import archive from './modules/archive'
import dialog from './modules/dialog'
import notifications from './modules/notifications'

import alerts from './modules/alerts'
import analytics from './modules/analytics'

// new
import tribe from './modules/tribe'
import subtribe from './modules/subtribe'
import community from './modules/community'
import collection from './modules/collection/'
import settings from './modules/settings/'
import story from './modules/story/'
import table from './modules/table'

import { apolloProvider } from '../plugins/vue-apollo'

const apollo = apolloProvider.defaultClient

Vue.use(Vuex)

/*
  TODO (later):
    - [ ] move loading and syncing to alerts modules
    - [ ] change modules to be namespaced
          - https://vuex.vuejs.org/guide/modules.html#namespacing
          - see alerts module for another example
*/

const rootModule = {
  state: {
    whoami: {
      public: {
        feedId: '',
        profile: {
          id: '',
          preferredName: '',
          aliveInterval: '',
          avatarImage: { uri: '' }
        }
      },
      personal: {
        groupId: '',
        profile: {
          id: '',
          preferredName: '',
          aliveInterval: '',
          avatarImage: { uri: '' }
        },
        settings: {
          keyBackedUp: null
        }
      }
    },
    loading: false,
    syncing: false,
    goBack: '', // TODO deprecate?
    currentAccess: null,
    allowSubmissions: true, // TODO extract to specific domain,
    isKaitiaki: false
  },

  getters: {
    loadingState: state => state.loading,
    syncing: state => state.syncing,
    whoami: state => state.whoami,
    isKaitiaki: state => state.isKaitiaki,

    // TODO-implement goBack to previous profile &| component
    goBack: state => state.goBack,
    currentAccess: state => state.currentAccess,
    allowSubmissions: state => state.allowSubmissions
  },

  mutations: {
    updateWhoami (state, whoami) {
      state.whoami = whoami
    },
    updateLoading (state, loading) {
      state.loading = loading
    },
    updateSyncing (state, syncing) {
      state.syncing = syncing
      setTimeout(() => {
        state.syncing = !state.syncing
      }, 30000)
    },

    updateGoBack (state, id) {
      state.goBack = id
    },
    setCurrentAccess (state, access) {
      state.currentAccess = access
    },
    setAllowSubmissions (state, allow) {
      state.allowSubmissions = allow
    },
    setIsKaitiaki (state, kaitiaki) {
      state.isKaitiaki = kaitiaki
    }
  },

  actions: {
    async setWhoami ({ commit }) {
      const result = await apollo.query(whoami)

      if (result.errors) throw result.errors

      commit('updateWhoami', result.data.whoami)
    },
    setLoading ({ commit }, loading) {
      commit('updateLoading', loading)
    },
    setSyncing ({ commit }, syncing) {
      commit('updateSyncing', syncing)
    },
    setGoBack ({ commit }, id) {
      commit('updateGoBack', id)
    }
  }
}

export default new Vuex.Store({
  ...rootModule,
  modules: {
    archive,
    dialog,
    notifications,
    alerts,
    analytics,

    // new
    tribe: tribe(apollo),
    subtribe: subtribe(apollo),
    community: community(apollo),
    collection: collection(apollo),
    story: story(apollo),

    person: person(apollo),
    whakapapa: whakapapa(apollo),

    table: table(apollo),

    settings: settings(apollo)
  }
})
