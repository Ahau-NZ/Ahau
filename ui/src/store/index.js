import Vue from 'vue'
import Vuex from 'vuex'
import { createProvider } from '../plugins/vue-apollo'

import whakapapa from './modules/whakapapa'
import person from './modules/person'
import archive from './modules/archive'
import dialog from './modules/dialog'
import notifications from './modules/notifications'
import tribe from './modules/tribe'
import { whoami } from '../lib/person-helpers.js'

const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    currentAccess: null,
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
        }
      }
    },
    loading: false,
    goBack: '',
    allowSubmissions: true,
    syncing: false
  },
  modules: {
    whakapapa,
    person,
    archive,
    dialog,
    notifications,
    tribe
  },
  getters: {
    loadingState: state => {
      return state.loading
    },
    syncing: state => {
      return state.syncing
    },
    whoami: state => {
      return state.whoami
    },
    // TODO-implement goBack to previous profile &| component
    goBack: state => {
      return state.goBack
    },
    currentAccess: state => {
      return state.currentAccess
    },
    allowSubmissions: state => {
      return state.allowSubmissions
    },
    accessOptions: ({ whoami, tribe }) => {
      return [
        { ...whoami.personal.profile, groupId: whoami.personal.groupId, isPersonalGroup: true },
        ...tribe.tribes
          .filter(tribe => tribe.private.length > 0) // only include tribes you have the private profile for...
          .map(tribe => {
            return {
              groupId: tribe.id,
              ...tribe.private[0]
            }
          })
      ]
    },
    defaultAccess: ({ whoami }) => {
      return (tribe, profile) => {
        if (profile.type === 'person') return { groupId: whoami.personal.groupId, ...whoami.personal.profile, isPersonalGroup: true }
        else if (profile.type === 'community') {
          return tribe.private.length > 0
            ? { groupId: tribe.id, ...tribe.private[0], type: 'community', isPersonalGroup: false }
            : null
        }
      }
    },
    getAccessFromRecps: ({ whoami }) => {
      return (recps, tribe) => {
        if (!recps || recps.length === 0) return null

        // turn the recps given to the matching group (personal or tribe)
        if (recps.includes(whoami.personal.groupId)) return { groupId: whoami.personal.groupId, ...whoami.personal.profile, isPersonalGroup: true }

        const recp = tribe
          .filter(d => {
            return d.private.length > 0
          })
          .find(d => {
            return recps.includes(d.id)
          })

        if (!recp || !recp.id || !recp.private) return null

        return { groupId: recp.id, isPersonalGroup: false, ...recp.private[0] }
      }
    }
  },
  mutations: {
    setAllowSubmissions (state, allow) {
      state.allowSubmissions = allow
    },
    setCurrentAccess (state, access) {
      state.currentAccess = access
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
    updateWhoami (state, whoami) {
      state.whoami = whoami
    },
    updateGoBack (state, id) {
      state.goBack = id
    }
  },
  actions: {
    setLoading ({ commit }, loading) {
      commit('updateLoading', loading)
    },
    setSyncing ({ commit }, syncing) {
      commit('updateSyncing', syncing)
    },
    async setWhoami ({ commit }) {
      const result = await apollo.query(whoami)

      if (result.errors) throw result.errors

      commit('updateWhoami', result.data.whoami)
    },
    setGoBack ({ commit }, id) {
      commit('updateGoBack', id)
    }
  }
})

export default store
