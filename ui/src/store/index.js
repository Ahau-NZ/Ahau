import Vue from 'vue'
import Vuex from 'vuex'
import { createProvider } from '../plugins/vue-apollo'

import whakapapa from './modules/whakapapa'
import person from './modules/person'
import archive from './modules/archive'
import dialog from './modules/dialog'
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
    goBack: {
      show: false,
      location: ''
    }
  },
  modules: {
    whakapapa,
    person,
    archive,
    dialog,
    tribe
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
    },
    currentAccess: state => {
      return state.currentAccess
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
    defaultAccess: ({ whoami, person, tribe }) => {
      const { currentProfile } = person
      const { currentTribe } = tribe

      if (currentProfile.type === 'person') return { groupId: whoami.personal.groupId, ...whoami.personal.profile, isPersonalGroup: true }
      else if (currentProfile.type === 'community') {
        return currentTribe.private.length > 0
          ? { groupId: currentTribe.id, ...currentTribe.private[0], type: 'community', isPersonalGroup: false }
          : null
      }
    },
    getAccessFromRecps: ({ whoami, tribe }) => {
      return recps => {
        if (!recps || recps.length === 0) return null

        // turn the recps given to the matching group (personal or tribe)
        if (recps.includes(whoami.personal.groupId)) return { groupId: whoami.personal.groupId, ...whoami.personal.profile, isPersonalGroup: true }

        const recp = tribe.tribes
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
    setCurrentAccess (state, access) {
      state.currentAccess = access
    },
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
      const result = await apollo.query(whoami)

      if (result.errors) throw result.errors

      commit('updateWhoami', result.data.whoami)
    },
    goBack ({ commit }, go) {
      commit('updateGoBack', go)
    }
  }
})

export default store
