import { initGroup, getTribe, getTribes, addAdminsToGroup, getMembers } from './apollo-helpers'
import { ACCESS_PRIVATE, ACCESS_ALL_MEMBERS, ACCESS_KAITIAKI } from '@/lib/constants'
import { getCustomFields, getDefaultFields, getRawCustomFields } from '@/lib/custom-field-helpers'
import { acceptGroupApplication, declineGroupApplication } from '@/lib/tribes-application-helpers'

import { pick, get } from 'lodash-es'

const defaultTribeSettings = {
  allowWhakapapaViews: true,
  allowStories: true,
  allowPersonsList: true,

  // public settings
  issuesVerifiedCredentials: false,
  acceptsVerifiedCredentials: false
}

export default function (apollo) {
  const state = {
    currentTribe: null,
    tribes: [],
    betaFeaturesEnabled: false
  }

  const getters = {
    betaFeaturesEnabled: (state, getters) => {
      return (
        state.betaFeaturesEnabled ||
        getters.tribeSettings?.issuesVerifiedCredentials ||
        getters.tribeSettings?.acceptsVerifiedCredentials
      )
    },
    tribeId: state => state?.currentTribe?.id,
    tribePoboxId: state => {
      return get(state, 'currentTribe.public[0].poBoxId')
    },
    adminTribeId: state => state?.currentTribe?.admin?.id,
    currentTribe: state => state.currentTribe,
    tribeSettings (state, getters) {
      const tribeProfile = getters.tribeProfile
      if (!tribeProfile) return null

      if (getters.isPersonalTribe) return defaultTribeSettings

      // NOTE: should only return the public setting for tribes we arent apart of
      return {
        // private settings
        ...pick(tribeProfile, ['allowWhakapapaViews', 'allowStories', 'allowPersonsList']),

        // public settings
        issuesVerifiedCredentials: get(getters.currentTribe, 'public[0].issuesVerifiedCredentials'),
        acceptsVerifiedCredentials: get(getters.currentTribe, 'public[0].acceptsVerifiedCredentials')
      }
    },
    tribeProfile (state, getters, rootState) {
      const tribe = state.currentTribe
      if (!tribe) return null

      if (getters.isPersonalTribe) {
        return rootState.whoami.personal.profile
      }

      const parentTribe = getters.parentTribe
      if (parentTribe) {
        // just use the parent groups profileId
        if (parentTribe.private.length) return parentTribe.private[0] // private profile
        if (parentTribe.public.length) return parentTribe.public[0] // public profile
      }

      if (tribe.private.length) return tribe.private[0] // private profile
      if (tribe.public.length) return tribe.public[0] // public profile

      // NOTE: we load public profiles in the case where we are looking at a tribe
      // we are not yet apart of

      console.error('Error loading tribe profile')

      return null
    },
    tribeJoiningQuestions (state, getters) {
      if (getters.isPersonalTribe) return []

      return get(state, 'currentTribe.public[0].joiningQuestions')
    },

    /*
     =========== CUSTOM FIELDS =================
    */
    rawTribeCustomFields (state, getters, _, rootGetters) {
      if (getters.isPersonalTribe) return []

      // for admin subgroups, we just use the parent groups custom field definitions
      const tribe = getters.parentTribe || state.currentTribe
      return getRawCustomFields(tribe, rootGetters.isKaitiaki)
    },
    tribeDefaultFields: (state, getters, _, rootGetters) => {
      return getDefaultFields(getters.rawTribeCustomFields)
        .filter(field => {
          return !field.tombstone && (field.visibleBy !== 'admin' || getters.isPersonalTribe || rootGetters.isKaitiaki)
        })
    },
    // tribeDefaultFields (state, getters) {
    //   return getDefaultFields(getters.rawTribeCustomFields)
    //     .filter(field => (
    //       // keep fields that are NOT person group, NOT kaitiaki-only
    //       !getters.isPersonalTribe ||
    //       field.visibleBy !== 'admin'
    //     ))
    // },
    tribeCustomFields (state, getters) {
      return getCustomFields(getters.rawTribeCustomFields)
    },
    tribeRequiredCustomFields (state, getters) {
      return getters.tribeCustomFields
        .filter(field => field.required)
    },
    tribeRequiredDefaultFields (state, getters) {
      return getters.tribeDefaultFields
        .filter(field => field.required)
    },
    tribeRequiredFields (state, getters) {
      return [...getters.tribeRequiredCustomFields, ...getters.tribeRequiredDefaultFields]
    },
    /*
     =========== CUSTOM FIELDS END =================
    */

    tribeKaitiaki (state, getters) {
      const tribe = state.currentTribe
      if (!tribe) return []
      if (getters.isPersonalTribe) return []

      const profile = getters.tribeProfile
      if (!profile || !profile.kaitiaki) return []

      return profile.kaitiaki
    },
    tribeMembers (state, getters) {
      const tribe = state.currentTribe

      if (!tribe) return []
      if (getters.isPersonalTribe) return []

      // get the members of the tribe
      return tribe.members || []
    },
    tribeProfileId (_, getters) {
      const profile = getters.tribeProfile
      if (!profile) return null

      return profile.id
    },
    isPersonalTribe (state, _, rootState) {
      if (!state.currentTribe) return false
      return state.currentTribe.id === rootState.whoami.personal.groupId
    },
    parentTribe (state, getters) {
      const tribe = state.currentTribe

      if (!tribe) return null
      if (getters.isPersonalTribe) return null

      // check if its the admin group for one of the tribes
      return state.tribes.find(otherTribe => {
        return otherTribe.admin && otherTribe.admin.id === tribe.id
      })
    },
    accessOptions (state, getters, rootState) {
      const tribe = state.currentTribe

      if (!tribe) return []

      if (getters.isPersonalTribe) {
        return [{
          type: ACCESS_PRIVATE,
          groupId: rootState.whoami.personal.groupId,
          profileId: rootState.whoami.personal.profile.id
        }]
      }

      const profileId = getters.tribeProfileId

      if (!profileId) return []

      const parentTribe = getters.parentTribe

      // if theres a parent group, it means the current tribe
      // is an admin tribe
      if (parentTribe) {
        return [{
          type: ACCESS_KAITIAKI,
          groupId: tribe.id,
          profileId // community profiel NOTE: admin subgroups dont have a community profile
        }]
      }

      const options = [{
        type: ACCESS_ALL_MEMBERS,
        groupId: tribe.id,
        profileId // community profile
      }]

      // only tribes you are apart of, that arent subtribes will have an admin group
      if (tribe.admin) {
        options.push({
          type: ACCESS_KAITIAKI,
          groupId: tribe.admin.id,
          profileId // community profile NOTE: admin subgroups dont have a community profile
        })
      }

      return options
    },
    tribes: state => state.tribes,
    joinedTribes: (state, getters) => getters.tribes.filter(tribe => get(tribe, 'private.length') && get(tribe, 'public.length')),
    customFieldsByTribe (state, getters) {
      return getters.joinedTribes.map(tribe => {
        return {
          tribeId: tribe.id,
          profileId: get(tribe, 'private[0].id'),
          preferredName: get(tribe, 'private[0].preferredName'),
          customFields: getCustomFields(get(tribe, 'public[0].customFields', []))
            .filter(field => !field.tombstone)
        }
      })
        .filter(tribe => get(tribe, 'customFields.length'))
    }
  }

  const mutations = {
    updateTribes (state, tribes) {
      state.tribes = tribes
    },
    setCurrentTribe (state, tribe) {
      state.currentTribe = tribe
    },
    resetCurrentTribe (state) {
      state.currentTribe = null
    },
    setBetaFeaturesEnabled (state, enabled) {
      state.betaFeaturesEnabled = enabled
    }
  }

  const actions = {
    resetCurrentTribe ({ commit }) {
      commit('resetCurrentTribe')
    },
    setCurrentTribe ({ commit }, tribe) {
      commit('setCurrentTribe', tribe)
    },
    updateTribes ({ commit }, tribes) {
      commit('updateTribes', tribes)
    },
    setBetaFeaturesEnabled ({ commit }, enabled) {
      commit('setBetaFeaturesEnabled', enabled)
    },
    async getTribe ({ rootState, dispatch }, id) {
      try {
        if (id === rootState.whoami.personal.groupId) {
          return {
            id: rootState.whoami.personal.groupId,
            admin: null,
            private: [rootState.whoami.personal.profile],
            public: [rootState.whoami.public.profile]
          }
        }

        const res = await apollo.query({
          ...getTribe,
          variables: {
            id
          }
        })

        if (res.errors) throw res.errors

        const tribe = res.data.tribe
        tribe.members = await dispatch('getMembers', id)

        return tribe
      } catch (err) {
        console.error('Something went wrong while fetching tribe: ', id)
        console.error(err)
      }
    },
    async loadTribe ({ getters, dispatch, state }, id) {
      try {
        dispatch('resetCurrentTribe')
        dispatch('person/emptyAllProfiles', null, { root: true })

        const tribe = await dispatch('getTribe', id)

        // set the current tribe
        dispatch('setCurrentTribe', tribe)

        if (!getters.accessOptions.length) return

        // set the default access
        dispatch('setCurrentAccess', getters.accessOptions[0], { root: true })
      } catch (err) {
        console.error('Something went wrong while trying to load a tribe', id)
        console.error(err)
      }
    },
    async getTribes ({ commit }) {
      try {
        const res = await apollo.query(getTribes)

        if (res.errors) throw res.errors
        commit('updateTribes', res.data.tribes)

        return res.data.tribes
      } catch (err) {
        console.error('Failed to get tribes', err)
        return []
      }
    },
    async initGroup ({ dispatch }, input) {
      try {
        const res = await apollo.mutate(
          initGroup(input)
        )

        if (res.errors) throw res.errors

        return dispatch('getTribe', res.data.initGroup.groupId) // groupId
      } catch (err) {
        console.error('failed to initialise the group, its profiles and kaitiaki-only subgroup', err)
      }
    },
    // NOTE: this is an alias for saveGroupProfileLink with a clearer name
    async createPrivateGroupProfileLink ({ dispatch }, input) {
      try {
        return dispatch('saveGroupProfileLink', input)
      } catch (err) {
        console.error('failed to create private link between group and profile')
      }
    },
    async addAdminsToGroup ({ dispatch }, { groupId, adminIds }) {
      try {
        const res = await apollo.mutate(
          addAdminsToGroup(groupId, adminIds)
        )

        if (res.errors) throw res.errors

        return dispatch('getTribe', groupId)
      } catch (err) {
        console.error('failed to add admin to group', err)
      }
    },
    async getMembers (context, groupId) {
      try {
        const res = await apollo.query(
          getMembers(groupId)
        )

        if (res.errors) throw res.errors

        return res.data.listGroupAuthors
      } catch (err) {
        console.error('failed to get the groups members', err)
      }
    },
    async approveRegistration ({ dispatch }, input) {
      try {
        const res = await apollo.mutate(
          acceptGroupApplication(input)
        )

        if (res.errors) throw res.errors

        dispatch('alerts/showMessage', 'The registration was approved!', { root: true })

        return res.data.acceptGroupApplication
      } catch (err) {
        console.error(err)
        dispatch('alerts/showError', 'Something went wrong while approving the registration!', { root: true })

        return null
      }
    },
    async declineRegistration ({ dispatch }, input) {
      try {
        const res = await apollo.mutate(
          declineGroupApplication(input)
        )

        if (res.errors) throw res.errors

        dispatch('alerts/showMessage', 'The registration was declined!', { root: true })
        return res.data.declineGroupApplication
      } catch (err) {
        console.error(err)
        dispatch('alerts/showError', 'Something went wrong while declining the registration!', { root: true })

        return null
      }
    }
  }
  return {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
  }
}
