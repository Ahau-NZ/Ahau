const state = {
  navComponent: 'profile',
  currentStory: {},
  showStory: false,
  showArtefact: false,
  isFromWhakapapaShow: false
}

const getters = {
  // TODO 2021-12-01, mix: this is only used by Appbar currently.
  // Migrate to root store module?
  navComponent: state => {
    return state.navComponent
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
  isFromWhakapapaShow: state => {
    return state.isFromWhakapapaShow
  }
}

const mutations = {
  updateComponent (state, component) {
    state.navComponent = component
  },
  setStory (state, story) {
    state.currentStory = story
  },
  updateShowStory (state) {
    state.showStory = !state.showStory
  },
  updateShowArtefact (state, payload) {
    state.showArtefact = (payload !== undefined) ? payload : !state.showArtefact
  },
  updateIsFromWhakapapaShow (state, update) {
    state.isFromWhakapapaShow = update
  }
}

const actions = {
  setCurrentStory ({ commit }, story) {
    commit('setStory', story)
  },
  toggleShowStory ({ commit }) {
    commit('updateShowStory')
  },
  setShowArtefact ({ commit }, state) {
    commit('updateShowArtefact', state)
  },
  setIsFromWhakapapaShow ({ commit }, state) {
    commit('updateIsFromWhakapapaShow', state)
  }
}

export default {
  state,
  mutations,
  actions,
  getters,
  namespaced: true
}
