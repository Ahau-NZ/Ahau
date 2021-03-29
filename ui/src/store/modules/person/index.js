import { apolloProvider } from '@/plugins/vue-apollo'
import { getRelatives } from '@/lib/person-helpers'
import tree from '@/lib/tree-helpers'

const apollo = apolloProvider.defaultClient

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

export default {
  state,
  mutations,
  actions,
  getters
}
