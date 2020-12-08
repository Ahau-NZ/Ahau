// import gql from 'graphql-tag'

const state = {
  activeComponent: 'profile',
  currentStory: {},
  showStory: false,
  showArtefact: false,
  stories: [],
  profileStories: []
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
  },
  stories: state => {
    return state.stories
  },
  profileStories: state => {
    return state.profileStories
  }
}

const mutations = {
  updateComponent (state, component) {
    state.activeComponent = component
  },
  setStory (state, story) {
    state.currentStory = story
  },
  updateShowStory (state) {
    state.showStory = !state.showStory
  },
  updateShowArtefact (state) {
    state.showArtefact = !state.showArtefact
  },
  updateStories (state, stories) {
    state.stories = stories
  },
  updateProfileStories (state, profileStories) {
    state.profileStories = profileStories
  }

}

const actions = {
  setCurrentStory ({ commit }, story) {
    commit('setStory', story)
  },
  toggleShowStory ({ commit }) {
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
