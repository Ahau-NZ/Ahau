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

  const actions = {
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
    async setProfileById ({ commit, rootState, dispatch }, { id, type }) {
      if (id === rootState.whoami.public.profile.id) {
        dispatch('setWhoami', id)
      }
      if (id === rootState.whoami.personal.profile.id) {
        dispatch('setWhoami', id)
      }
      // if viewing a story and sideview is open and you want to jump to another profile > close the story
      if (rootState.archive.showStory && rootState.dialog.preview) {
        dispatch('toggleShowStory')
      }
      if (type !== 'setWhanau' && rootState.dialog.dialog) {
        dispatch('setDialog', null)
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
