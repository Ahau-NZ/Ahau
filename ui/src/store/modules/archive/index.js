const state = {
  currentStory: {},
  showStory: false,
  showArtefact: false,
  isFromWhakapapaShow: false,
  isFromPersonIndex: false
}

const getters = {
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
  },
  isFromPersonIndex: state => {
    return state.isFromPersonIndex
  }
}

const mutations = {
  setStory (state, story) {
    state.currentStory = story
  },
  updateShowStory (state) {
    state.showStory = !state.showStory
  },
  updateShowArtefact (state, payload) {
    state.showArtefact = (payload !== undefined) ? payload : !state.showArtefact
  },
  setIsFromWhakapapaShow (state, update) {
    state.isFromWhakapapaShow = update
  },
  setIsFromPersonIndex (state, update) {
    state.isFromPersonIndex = update
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
  }
}

export default {
  state,
  mutations,
  actions,
  getters,
  namespaced: true
}
