import { whoami } from '../lib/person-helpers.js'
import { ACCESS_TYPES, ACCESS_KAITIAKI } from '../lib/constants.js'

const SECOND = 1000

export default function rootModule (apollo) {
  return {
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
      loading: false, // boolean
      loadingTimeout: 2 * SECOND,
      navComponent: 'profile',

      /* indexing data */
      indexingSince: null,
      isIndexing: false,
      isRebuilding: false,
      percentageIndexed: 100,
      percentageIndexedSinceStartup: 100,

      syncing: false, // when you're joing a pataka
      goBack: '', // TODO deprecate?
      allowSubmissions: true, // TODO extract to specific domain,

      // TODO mix 2021-12-09 move these to the tribe module (?) :
      currentAccess: null,
      isKaitiaki: false
    },

    getters: {
      whoami: state => state.whoami,
      navComponent: state => state.navComponent,
      loadingState: state => {
        if (state.isRebuilding) return state.percentageIndexedSinceStartup

        // if it's been indexing longer than 2 seconds
        if (
          state.indexingSince &&
          (Date.now() - state.indexingSince > state.loadingTimeout)
        ) {
          return state.percentageIndexedSinceStartup
        }

        return state.loading
      },
      syncing: state => state.syncing,
      isKaitiaki: state => {
        return (
          state.isKaitiaki ||
          (state.currentAccess && state.currentAccess.type === ACCESS_KAITIAKI)
        )
      },

      // TODO-implement goBack to previous profile &| component
      goBack: state => state.goBack,
      currentAccess: state => state.currentAccess,
      allowSubmissions: state => state.allowSubmissions
    },

    mutations: {
      updateWhoami (state, whoami) {
        state.whoami = whoami
      },
      setNavComponent (state, component) {
        state.navComponent = component
      },
      updateLoading (state, loading) {
        state.loading = loading
      },
      updateIndexingData (state, { isIndexing, isRebuilding, percentageIndexed, percentageIndexedSinceStartup }) {
        if (!isIndexing && !isRebuilding) state.indexingSince = null
        else if (!state.isIndexingSince) state.indexingSince = Date.now()

        if (typeof isIndexing === 'boolean') state.isIndexing = isIndexing
        if (typeof isRebuilding === 'boolean') state.isRebuilding = isRebuilding
        if (typeof percentageIndexed === 'number') state.percentageIndexed = roundOneDP(percentageIndexed)
        if (typeof percentageIndexedSinceStartup === 'number') {
          state.percentageIndexedSinceStartup = roundOneDP(percentageIndexedSinceStartup)
        }
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
        if (
          !access ||
          !ACCESS_TYPES.includes(access.type) ||
          !access.groupId ||
          !access.profileId
        ) {
          console.error('invalid accessOption', access)
          return
        }
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
      setCurrentAccess ({ commit }, access) {
        commit('setCurrentAccess', access)
      },
      setLoading ({ commit }, loading) {
        commit('updateLoading', loading)
      },
      setIndexingData ({ commit }, data) {
        commit('updateIndexingData', data)
      },
      setSyncing ({ commit }, syncing) {
        commit('updateSyncing', syncing)
      },
      setGoBack ({ commit }, id) {
        commit('updateGoBack', id)
      },
      setNavComponent ({ commit }, component) {
        commit('setNavComponent', component)
      },
      setIsKaitiaki ({ commit }, bool = false) {
        commit('setIsKaitiaki', bool)
      }
    }
  }
}

function roundOneDP (percent) {
  return Math.round(percent * 10) / 10
}
