import Vue from 'vue'
import { isEmpty, cloneDeep as clone } from 'lodash-es'
import pull from 'pull-stream'
import pullParaMap from 'pull-paramap'
import Pushable from 'pull-pushable'

import { getPerson as getPersonAndWhanau, mergeAdminProfile } from '@/lib/person-helpers'
import {
  getPersonMinimal,
  getPersonCustomFields,
  savePerson as savePersonMutation,
  getPersonFull,
  deletePerson,
  findPersonByName,
  loadPersonList
} from './apollo-helpers'

import { dateIntervalToString } from '@/lib/date-helpers'
import calculateAge from '@/lib/calculate-age'
import { determineFilter } from '@/lib/filters'

import { ACCESS_PRIVATE, ACCESS_ALL_MEMBERS, ACCESS_KAITIAKI } from '@/lib/constants'
import i18n from '@/plugins/i18n'

const queue = Pushable()
// use by going queue.push(runPromise)
// where runPromise(done) returns a Promise which calls done() once finished
pull(
  queue,
  pullParaMap(
    (continuable, done) => continuable(done),
    10 // width of parallel processing
  ),
  pull.drain()
)

export default function (apollo) {
  const state = {
    selectedProfileId: null,
    // Object used for whakapapa tree
    profiles: {
      // ...minimalProfile || ...fullProfile,
      // isMinimal: true   || false
    },
    // Array used for personIndex page
    profilesArr: [],
    tombstoned: new Set(),
    activeLoadingCount: 0,
    loadingProfiles: false
  }

  const getters = {
    person: state => (profileId) => state.profiles[profileId],
    profilesArr: (state, getters, rootState, rootGetters) => {
      return state.profilesArr.filter(d => determineFilter({ data: d }, rootGetters['table/tableFilter'])) // Array needed for personIndex page
    },
    personPlusFamily: (state, getters, rootState, rootGetters) => (id) => {
      // this method provides a person profile and extends it with getters for parents/ children/ partners
      // NOTE this recursive, so you go e.g. profile.parents[0].partners
      // NOTE this only builds on links already in the whakapapa store
      const profile = getters.person(id)
      if (!profile) return

      return {
        ...profile,
        get parents () {
          return rootGetters['whakapapa/getParentIds'](id).map(getters.personPlusFamily)
        },
        get children () {
          return rootGetters['whakapapa/getChildIds'](id).map(getters.personPlusFamily)
        },
        get partners () {
          return rootGetters['whakapapa/getPartnerIds'](id).map(getters.personPlusFamily).reverse()
        },
        get siblings () {
          return rootGetters['whakapapa/getSiblingIds'](id).map(getters.personPlusFamily)
        }
      }
    },
    selectedProfileId: (state) => state.selectedProfileId,
    selectedProfile: (state, getters, rootState, rootGetters) => {
      if (!state.selectedProfileId) return

      return getters.personPlusFamily(state.selectedProfileId)
    },
    isTombstoned: state => (profileId) => state.tombstoned.has(profileId),
    isLoadingProfiles: state => state.loadingProfiles // changed to boolean to avoid unnecessary re-renders
  }

  const mutations = {
    setSelectedProfileId (state, id) {
      state.selectedProfileId = id
    },

    // Set used for building the whakapapa tree =============
    setPerson (state, profile) {
      Vue.set(state.profiles, profile.id, profile)
    },
    tombstoneId (state, profileId) {
      state.tombstoned.add(profileId)
    },
    incrementLoading (state) {
      state.activeLoadingCount = state.activeLoadingCount + 1
    },
    decrementLoading (state) {
      state.activeLoadingCount = state.activeLoadingCount - 1
      state.loadingProfiles = state.activeLoadingCount > 1
    },
    // =======================================================

    // Array used for personIndex ============================
    setProfilesArr (state, profiles) {
      state.profilesArr = profiles
    },
    setProfileInArr (state, profile) {
      state.profilesArr.unshift(mapProfileData(profile))
    },
    updateProfileInArr (state, profile) {
      const index = state.profilesArr.findIndex((el) => el.id === profile.id)
      state.profilesArr.splice(index, 1, mapProfileData(profile))
    },
    deleteProfileInArr (state, id) {
      const index = state.profilesArr.findIndex((el) => el.id === id)
      state.profilesArr.splice(index, 1)
    },
    // =======================================================

    emptyAllProfiles (state) {
      state.profilesArr = []
      state.profiles = {}
    }
  }

  async function savePerson (input) {
    const res = await apollo.mutate(savePersonMutation(input))
    if (res.errors) throw res.errors

    return res.data.savePerson // profileId
  }

  const actions = {
    emptyAllProfiles ({ commit }) {
      commit('emptyAllProfiles')
    },
    async personListAdd ({ commit, dispatch, getters }, id) {
      const profile = await dispatch('loadPersonFull', id)
      commit('setProfileInArr', mergeAdminProfile(profile))
    },
    async personListUpdate ({ commit }, profile) {
      commit('updateProfileInArr', mergeAdminProfile(profile))
    },
    async personListDelete ({ commit }, id) {
      commit('deleteProfileInArr', id)
    },
    async createPerson (_, input) {
      try {
        if (!input.type) throw new Error('a profile type is required to create a person')
        if (!input.authors) throw new Error('profile authors is required to create a person')

        return savePerson(pruneInput(input))
      } catch (err) {
        console.error('Something went wrong while trying to create a person', input)
        console.error(err)
        throw err
      }
    },
    async getPersonMinimal (_, profileId) {
      // ONLY details needed for rendering Nodes in graph
      // make a Promise which defers execution to a queue
      return new Promise((resolve, reject) => {
        const runQuery = (done) => apollo.query(getPersonMinimal(profileId))
          .catch(reject)
          .then(res => {
            if (res.errors) reject(res.errors)
            else resolve(res.data.person)
          })
          .finally(done)

        // put apollo query in a "continuable" and place that in queue.
        // Note runQuery closes over our resolve/reject so that when it gets to front
        // of the queue results can be sent back to original person calling this action
        queue.push(runQuery)
      })
    },
    async getPersonFull (_, profileId) {
      // ALL profile fields AND any associated admin profile
      return new Promise((resolve, reject) => {
        const runQuery = (done) => apollo.query(getPersonFull(profileId))
          .catch(reject)
          .then(res => {
            if (res.errors) reject(res.errors)
            else resolve(res.data.person)
          })
          .finally(done)

        // see comments in getPersonMinimal
        queue.push(runQuery)
      })
    },
    async getPerson (_, profileId) {
      // loads all profile fields + siblings, partners, ....
      // TODO look into deprecating this - should use getPersonFull + look some load-around?
      try {
        const res = await apollo.query(getPersonAndWhanau(profileId))

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a person', err)
      }
    },
    async getPersonCustomFields (_, profileId) {
      try {
        const res = await apollo.query(getPersonCustomFields(profileId))

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a person', err)
      }
    },
    async updatePerson (_, input) {
      try {
        if (!input.id) throw new Error('a profile id is required to update a person')

        return savePerson(input) // profileId
      } catch (err) {
        console.error('Something went wrong while trying to update a person', input)
        console.error(err)
      }
    },
    async deletePerson ({ commit, dispatch }, { id, details, allowPublic }) {
      try {
        if (!id) throw new Error('a profile id is required to delete a person')

        const res = await apollo.mutate(deletePerson(id, details, allowPublic))

        if (res.errors) throw res.errors
        dispatch('tombstoneProfile', id)
        dispatch('alerts/showMessage', 'Person successfully deleted!', { root: true })
        return res.data.tombstoneProfileAndLinks
      } catch (err) {
        if (err.message.includes('whakapapa')) dispatch('alerts/showError', err.message, { root: true })
        else {
          const message = 'Something went wrong while trying to delete a person'
          dispatch('alerts/showError', message, { root: true })
          console.error(message, id)
          console.error(err)
          throw err
        }
        return null
      }
    },

    async loadPersonMinimal ({ state, dispatch, commit }, profileId) {
      if (state.tombstoned.has(profileId)) return
      commit('incrementLoading')

      try {
        const profile = await dispatch('getPersonMinimal', profileId)
        if (profile.tombstone) dispatch('tombstoneProfile', profileId)
        else commit('setPerson', profile)

        commit('decrementLoading')
        return profile
      } catch (err) {
        console.error('loadPersonMinimal error', err) // TODO error alert message
        commit('decrementLoading')
        return {}
      }
    },
    async loadPersonFull ({ state, dispatch, commit }, profileId) {
      if (state.tombstoned.has(profileId)) return
      commit('incrementLoading')

      try {
        const profile = await dispatch('getPersonFull', profileId)
        if (profile.tombstone) dispatch('tombstoneProfile', profileId)
        else commit('setPerson', profile)

        commit('decrementLoading')
        return profile
      } catch (err) {
        console.error('loadPersonFull error', err) // TODO error alert message
        commit('decrementLoading')
        return {}
      }
    },
    async loadPersonAndWhanau ({ state, dispatch, commit }, profileId) {
      if (state.tombstoned.has(profileId)) return
      commit('incrementLoading')

      try {
        const profile = await dispatch('getPerson', profileId)
        if (profile && profile.tombstone) dispatch('tombstoneProfile', profileId)
        else commit('setPerson', profile)

        commit('decrementLoading')
        return profile
      } catch (err) {
        console.error('loadPersonFull error', err) // TODO error alert message
        commit('decrementLoading')
        return {}
      }
    },
    async setSelectedProfileById ({ dispatch }, id) {
      // legacy : TODO go through app and change to setSelectedProfileId
      dispatch('setSelectedProfileId', id)
    },
    async setSelectedProfileId ({ dispatch, commit, rootState }, id) {
      commit('setSelectedProfileId', id)

      if (!id) return

      dispatch('loadPersonFull', id)

      if (id === rootState.whoami.public.profile.id) {
        dispatch('setWhoami', id, { root: true })
      }
      if (id === rootState.whoami.personal.profile.id) {
        dispatch('setWhoami', id, { root: true })
      }
      // if viewing a story and sideview is open and you want to jump to another profile > close the story
      if (rootState.archive.showStory && rootState.dialog.preview) {
        dispatch('archive/toggleShowStory', null, { root: true })
      }
      if (rootState.dialog.dialog) {
        dispatch('setDialog', null, { root: true })
      }
    },
    async findPersonsByNameWithinGroup ({ dispatch, rootState }, name) {
      const currentAccess = rootState.currentAccess
      if (!currentAccess) return []

      const { type, groupId } = currentAccess

      let suggestions = []

      if (type === ACCESS_ALL_MEMBERS) suggestions = await dispatch('findPersonByName', { name, groupId, type: 'person' })
      if (type === ACCESS_KAITIAKI) suggestions = await dispatch('findPersonByName', { name, groupId, type: 'person/admin' })
      if (type === ACCESS_PRIVATE) {
        const source = await dispatch('findPersonByName', { name, groupId, type: 'person/source' })
        const other = await dispatch('findPersonByName', { name, groupId, type: 'person' })
        suggestions = [...source, ...other]
      }

      return suggestions
    },
    async findPersonByName (context, opts) {
      const { name, type, groupId } = opts

      if (!name) return

      // need to escape brackets for regexp
      const safeName = name
        .replace('(', '\\(')
        .replace(')', '\\)')

      try {
        const res = await apollo.query(findPersonByName(safeName, type, groupId))

        if (res.errors) throw res.errors

        return res.data.findPersons
      } catch (err) {
        console.error('Something went wrong while trying to find persons by name: ' + name)
        console.error(err)
      }
    },
    async getPersonsList (context, { type, groupId }) {
      if (!groupId) return []

      try {
        const res = await apollo.query(loadPersonList(type, groupId))
        if (res.errors) throw res.errors

        return res.data.listPerson
      } catch (err) {
        console.error('Something went wrong while trying to load person list')
        console.error(err)
      }
    },
    async loadPersonList ({ commit, dispatch, rootGetters }) {
      // get member profiles (NOTE this also has .adminProfile)
      const groupId = rootGetters['tribe/tribeId']
      const groupProfiles = await dispatch('getPersonsList', { type: 'group', groupId })

      const adminGroupId = rootGetters['tribe/adminTribeId']
      const adminProfiles = (await dispatch('getPersonsList', { type: 'admin', groupId: adminGroupId }))
        .filter(adminProfile => {
          // filter out profiles that are already linked to a profile in the groupProfiles array
          return !groupProfiles.some(groupProfile => groupProfile?.adminProfile?.id === adminProfile.id)
        })

      const profiles = clone(groupProfiles)
        .map(mergeAdminProfile)
        .concat(adminProfiles)
        .map(mapProfileData)

      commit('setProfilesArr', profiles)
      for (const profile of profiles) {
        commit('setPerson', profile)
      }
    },
    tombstoneProfile ({ commit, dispatch }, profileId) {
      commit('tombstoneId', profileId)
      dispatch('whakapapa/removeLinksToProfile', profileId, { root: true })
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

function pruneInput (input) {
  for (const [field, value] of Object.entries(input)) {
    if (value === null) continue
    else if (typeof value === 'string' && value === '') delete input[field]
    else if (Array.isArray(value)) {
      if (
        value.length === 0 ||
        (value.length === 1 && value[0] === '')
      ) delete input[field]
    } // eslint-disable-line
    else if (typeof value === 'object' && value.add) {
      if (value.add.length === 0) delete input[field]
    }
  }

  return input
}

function mapProfileData (profile) {
  if (profile.aliveInterval) {
    profile.dob = computeDate('dob', profile.aliveInterval)
    profile.dod = computeDate('dod', profile.aliveInterval)
    profile.age = age(profile.aliveInterval)
    profile.altNames = altNames(profile.altNames)
  }

  if (profile.customFields && Array.isArray(profile.customFields)) {
    profile.customFields = profile.customFields
      .reduce((acc, field) => {
        return { ...acc, [field.key]: field.value }
      }, {})
  }

  return profile
}

function altNames (altArray) {
  if (isEmpty(altArray)) return ''
  return altArray.join(', ')
}

function computeDate (requiredDate, age) {
  if (!age) {
    return ''
  }
  let ageString = ''
  const dateSplit = dateIntervalToString(age, monthTranslations).split('-')
  if (requiredDate === 'dob') {
    if (dateSplit[0]) {
      ageString = dateSplit[0]
    }
  }
  if (requiredDate === 'dod') {
    if (dateSplit[1]) {
      ageString = dateSplit[1]
    }
  }
  return ageString
}

function age (born) {
  const age = calculateAge(born)
  if (age || age === 0) {
    return age.toString()
  }
  return age
}

function monthTranslations (key, vars) {
  return i18n.t('months.' + key, vars)
}
