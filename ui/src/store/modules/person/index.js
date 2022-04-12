import Vue from 'vue'

import { getPerson as getPersonAndWhanau } from '@/lib/person-helpers'
import {
  getPersonMinimal,
  savePerson as savePersonMutation,
  deletePerson, getPersonFull,
  findPersonByName
} from './apollo-helpers'

export default function (apollo) {
  const state = {
    selectedProfileId: null,
    profiles: {
      // ...minimalProfile || ...fullProfile,
      // isMinimal: true   || false
    },
    tombstoned: new Set()
  }

  const getters = {
    person: state => (profileId) => state.profiles[profileId],
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
          return rootGetters['whakapapa/getPartnerIds'](id).map(getters.personPlusFamily)
        }
      }
    },
    selectedProfileId: (state) => state.selectedProfileId,
    selectedProfile: (state, getters, rootState, rootGetters) => {
      if (!state.selectedProfileId) return

      return getters.personPlusFamily(state.selectedProfileId)
    },
    isTombstoned: state => (profileId) => state.tombstoned.has(profileId)
  }

  const mutations = {
    setSelectedProfileById (state, id) {
      state.selectedProfileId = id
    },
    setPerson (state, profile) {
      Vue.set(state.profiles, profile.id, profile)
    },
    tombstoneId (state, profileId) {
      state.tombstoned.add(profileId)
    }
  }

  async function savePerson (input) {
    const res = await apollo.mutate(savePersonMutation(input))
    if (res.errors) throw res.errors

    return res.data.saveProfile // profileId
  }

  const actions = {
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
    async getPerson (_, profileId) {
      // loads all profile fields + siblings, partners, ....
      // TODO look into deprecating this - should use getPersonFull + loadDescendants
      try {
        const res = await apollo.query(getPersonAndWhanau(profileId))

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a person', err)
      }
    },
    async getPersonFull (_, profileId) {
      // loads all profile fields AND any associated admin profile
      try {
        const res = await apollo.query(getPersonFull(profileId))

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a persons details')
      }
    },
    async getPersonMinimal (_, profileId) {
      // loads a profile with only what's needed for the tree (avatar / things needed for fallback, name, ordering info)
      try {
        const res = await apollo.query(getPersonMinimal(profileId))

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a person (minimal)', profileId)
        console.error(err)
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

        commit('tombstoneId', id)
        dispatch('whakapapa/removeLinksToProfile', id, { root: true })
        return res.data.saveProfile
      } catch (err) {
        console.error('Something went wrong while trying to delete a person', id)
        console.error(err)
      }
    },

    async loadPersonMinimal ({ state, dispatch, commit }, profileId) {
      if (state.tombstoned.has(profileId)) return

      const profile = await dispatch('getPersonMinimal', profileId)
      if (profile.tombstone) {
        commit('tombstoneId', profileId)
        dispatch('whakapapa/removeLinksToProfile', profileId, { root: true })
      } // eslint-disable-line
      else commit('setPerson', profile)
    },
    async loadPersonFull ({ state, dispatch, commit }, profileId) {
      if (state.tombstoned.has(profileId)) return

      const profile = await dispatch('getPersonFull', profileId)
      if (profile.tombstone) {
        commit('tombstoneId', profileId)
        dispatch('whakapapa/removeLinksToProfile', profileId, { root: true })
      } // eslint-disable-line
      else commit('setPerson', profile)
    },
    async setSelectedProfileById ({ dispatch, commit, rootState }, id) {
      commit('setSelectedProfileById', id)

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
