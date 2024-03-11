import { get } from 'lodash-es'
import Vue from 'vue'

import { whoami } from '../lib/person-helpers.mjs'
import { ACCESS_TYPES, ACCESS_KAITIAKI } from '../lib/constants.mjs'

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
      linkedProfiles: {},
      navComponent: 'profile',

      goBack: '', // TODO deprecate?
      allowSubmissions: true, // TODO extract to specific domain,

      // TODO mix 2021-12-09 move these to the tribe module (?) :
      currentAccess: null
    },

    getters: {
      whoami: state => state.whoami,
      linkedProfiles: state => state.linkedProfiles,
      getPersonalProfileInTribe: (_, getters) => {
        return (tribeId) => {
          return Object.values(getters.linkedProfiles)
            .find(profile => {
              return (
                profile.recps &&
                profile.recps[0] === tribeId // TODO: extend this to search for poBoxId as well
              )
            })
        }
      },
      isMyProfile: state => (profileId) => {
        if (!profileId) return false
        return get(state, 'whoami.linkedProfileIds', []).includes(profileId)
      },
      navComponent: state => state.navComponent,
      isKaitiaki: (state, getters) => {
        if (getters['tribe/isPersonalTribe']) return true

        // if you're in the kaitiaki tribe, you're a kaitiaki
        if (state.currentAccess && state.currentAccess.type === ACCESS_KAITIAKI) return true

        // otherwise look at the current tribes profile, to see if you're a listed kaitiaki
        const kaitiaki = getters['tribe/tribeKaitiaki']

        return kaitiaki.some(kaitiaki => {
          return kaitiaki.feedId === state.whoami.public.feedId
        })
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
      updateLinkedProfile (state, profile) {
        Vue.set(state.linkedProfiles, profile.id, profile)
      }
    },

    actions: {
      async setWhoami ({ commit, dispatch }) {
        const result = await apollo.query(whoami)

        if (result.errors) throw result.errors

        commit('updateWhoami', result.data.whoami)

        await dispatch('updateLinkedProfiles', result.data.whoami.linkedProfileIds)
      },
      async updateLinkedProfiles ({ commit, dispatch }, linkedProfileIds = []) {
        await Promise.all(
          linkedProfileIds.map(async profileId => {
            // TODO: should this include admin profiles
            // where recps = [poBoxId, feedId]
            const profile = await dispatch('person/getPersonCustomFields', profileId, { root: true })
            commit('updateLinkedProfile', profile)

            return profile
          })
        )
      },
      setCurrentAccess ({ commit }, access) {
        commit('setCurrentAccess', access)
      },
      setGoBack ({ commit }, id) {
        commit('updateGoBack', id)
      },
      setNavComponent ({ commit }, component) {
        commit('setNavComponent', component)
      }
    }
  }
}
