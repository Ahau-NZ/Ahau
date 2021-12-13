import Vue from 'vue'
import { getRelatives, getPerson, savePerson } from '@/lib/person-helpers'
import { getPersonMinimal } from './apollo-helpers'
import { clone } from 'lodash'

export default function (apollo) {
  const state = {
    selectedProfile: {}, // TODO change to selectedProfileId ??
    profileMinimal: {}
  }

  const getters = {
    selectedProfile (state) {
      return state.selectedProfile
    },
    personMinimal: state => (profileId) => {
      return clone(state.profileMinimal[profileId])
    }
  }

  const mutations = {
    updateSelectedProfile (state, profile) {
      state.selectedProfile = profile
    },
    setPersonMinimal (state, { profileId, profile }) {
      Vue.set(state.profileMinimal, profileId, profile)
    }
  }

  //
  // createPerson
  // readPerson
  // updatePerson
  // destroyPerson/ tombstonePerson
  //
  const actions = {
    // TODO remove this in the long run
    async savePerson (context, input) {
      try {
        const res = await apollo.mutate(
          savePerson(input)
        )

        if (res.errors) throw res.errors

        return res.data.saveProfile // profileId
      } catch (err) {
        console.error('Something went wrong while trying to save a person', input)
        console.error(err)
      }
    },
    async createPerson ({ dispatch }, input) {
      try {
        if (!input.type) throw new Error('profile.type is required on createPerson()')
        if (!input.recps) throw new Error('profile.recps is required on createPerson()')
        if (!input.authors) throw new Error('profile.authors is required on createPerson()')
        if (input.id) throw new Error('profile.id is not allowed on createPerson()')

        return dispatch('savePerson', input) // profileId
      } catch (err) {
        console.error('Something went wrong while trying to create a person', input)
        console.error(err)
      }
    },
    async getPerson (context, profileId) {
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
    async loadPersonMinimal ({ commit }, profileId) {
      try {
        const res = await apollo.query(getPersonMinimal(profileId))
        if (res.errors) throw res.errors

        commit('setPersonMinimal', { profileId, profile: res.data.person })
      } catch (err) {
        console.error('Something went wrong while trying to get a person', err)
      }
    },
    updateSelectedProfile ({ commit }, profile) {
      commit('updateSelectedProfile', profile)
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
