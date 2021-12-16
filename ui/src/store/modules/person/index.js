import { savePersonMutation, deletePersonMutation } from './apollo-helpers'
import { getRelatives, getPerson } from '@/lib/person-helpers'

export default function (apollo) {
  const state = {
    selectedProfile: {}
  }

  const getters = {
    selectedProfile: state => {
      return state.selectedProfile
    }
  }

  const mutations = {
    updateSelectedProfile (state, profile) {
      state.selectedProfile = profile
    }
  }

  async function savePerson (input) {
    const res = await apollo.mutate(
      savePersonMutation(input)
    )

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
      try {
        const res = await apollo.query(
          getPerson(profileId)
        )

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
    async deletePerson (_, { id, allowPublic }) {
      try {
        if (!id) throw new Error('a profile id is required to delete a person')

        const res = await apollo.mutate(
          deletePersonMutation(id, allowPublic)
        )

        if (res.errors) throw res.errors

        return res.data.saveProfile
      } catch (err) {
        console.error('Something went wrong while trying to delete a person', id)
        console.error(err)
      }
    },
    updateSelectedProfile ({ commit }, profile) {
      commit('updateSelectedProfile', profile)
    },
    // NOTE: this is similar to the method below
    async setSelectedProfileById ({ dispatch, commit }, profileId) {
      var person = await dispatch('getPerson', profileId)
      commit('updateSelectedProfile', person)
    },
    async setProfileById ({ commit, rootState, dispatch }, { id, type }) {
      // NOTE to dispatch outide this namespace, we use:
      //   dispatch(actionName, data, { root: true })
      //
      // ref: https://vuex.vuejs.org/guide/modules.html#namespacing
      if (id === rootState.whoami.public.profile.id) {
        dispatch('setWhoami', id, { root: null })
      }
      if (id === rootState.whoami.personal.profile.id) {
        dispatch('setWhoami', id, { root: null })
      }
      // if viewing a story and sideview is open and you want to jump to another profile > close the story
      if (rootState.archive.showStory && rootState.dialog.preview) {
        dispatch('archive/toggleShowStory', null, { root: true })
      }
      if (type !== 'setWhanau' && rootState.dialog.dialog) {
        dispatch('setDialog', null, { root: true })
      }
      var person = await getRelatives(id, apollo)
      commit('updateSelectedProfile', person)
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
