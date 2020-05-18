// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

const state = {
  activeComponent: 'profile',
  currentStory: {},
  showStory: false
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
  }
}

const actions = {
  setComponent ({ commit }, component) {
    commit('updateComponent', component)
  },
  setStory ({ commit }, story) {
    commit('updateStory', story)
  },
  setShowStory ({ commit }) {
    commit('updateShowStory')
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
