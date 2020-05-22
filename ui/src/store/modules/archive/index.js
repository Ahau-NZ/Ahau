// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

const state = {
  activeComponent: 'profile',
  currentStory: {},
  showStory: false,
  showArtefact: false
}

const getters = {
  activeComponent: state => {
    return state.activeComponent
  },
  currentStory: state => {
    return state.currentStory
  },
  showStory: state => {
    return state.showStory
  },
  showArtefact: state => {
    return state.showArtefact
  }
}

const mutations = {
  updateComponent (state, component) {
    state.activeComponent = component
  },
  updateStory (state, story) {
    state.currentStory = story
  },
  updateShowStory (state) {
    state.showStory = !state.showStory
  },
  updateShowArtefact (state) {
    state.showArtefact = !state.showArtefact
  }
}

const actions = {
  setComponent ({ commit, dispatch, rootState }, component) {
    if (rootState.dialog.dialog) dispatch('setDialog', null)
    if (state.showStory) commit('updateShowStory')
    commit('updateComponent', component)
  },
  setStory ({ commit }, story) {
    commit('updateStory', story)
  },
  setShowStory ({ commit }) {
    commit('updateShowStory')
  },
  setShowArtefact ({ commit }) {
    commit('updateShowArtefact')
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
