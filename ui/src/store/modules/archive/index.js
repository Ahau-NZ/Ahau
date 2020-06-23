// import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { GET_ALL_STORIES } from '../../../lib/story-helpers'

const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

const state = {
  activeComponent: 'profile',
  currentStory: {},
  showStory: false,
  showArtefact: false,
  stories: []
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
  }
}

const mutations = {
  addStoryToStories (state, story) {
    state.stories.push(story)
  },
  deleteStoryFromStories (state, deletedStory) {
    const index = state.stories.findIndex(story => story.id === deletedStory.id)
    if (index !== -1) state.stories.splice(index, 1)
  },
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
  updateStoryInStories (state, updatedStory) {
    const index = state.stories.findIndex(story => story.id === updatedStory.id)
    if (index !== -1) state.stories.splice(index, 1, updatedStory)
  }
}

const actions = {
  setComponent ({ commit, dispatch, rootState }, component) {
    if (rootState.dialog.dialog) dispatch('setDialog', null)
    if (state.showStory) commit('updateShowStory')
    commit('updateComponent', component)
  },
  setShowStory ({ commit }) {
    commit('updateShowStory')
  },
  setShowArtefact ({ commit }) {
    commit('updateShowArtefact')
  },
  async getAllStories ({ commit }) {
    const res = await apollo.query(GET_ALL_STORIES)

    if (res.errors) {
      console.error('error fetching all stories', res)
      commit('updateStories', [])
      return
    }

    commit('updateStories', res.data.stories)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
