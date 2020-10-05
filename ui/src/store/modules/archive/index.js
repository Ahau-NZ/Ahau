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
  addStoryToStories (state, story) {
    state.stories.push(story)
  },
  deleteStoryFromStories (state, deletedStory) {
    const index = state.stories.findIndex(story => story.id === deletedStory.id)
    if (index !== -1) state.stories.splice(index, 1)
    const profileIndex = state.profileStories.findIndex(story => story.id === deletedStory.id)
    if (profileIndex !== -1) state.profileStories.splice(index, 1)
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
  },
  updateProfileStories (state, profileStories) {
    state.profileStories = profileStories
  }

}

const actions = {
  setCurrentStory ({ commit }, story) {
    commit('setStory', story)
  },
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
  setProfileStories ({ commit, rootState }) {
    console.log('setting profile stories')
    const stories = rootState.archive.stories
    if (rootState.person.currentProfile && rootState.person.currentProfile.type === 'person') {
      console.log('its a person profile')
      const profileStories = stories.filter((story) =>
        story.mentions.some((mention) =>
          mention.profile.id === rootState.person.currentProfile.id
        )).reverse()
      return commit('updateProfileStories', profileStories)
    } else if (rootState.person.currentProfile && rootState.person.currentProfile.type === 'community') {
      console.log('its a community profile')
      const communityStories = stories.filter((story) =>
        story.recps.some((recp) =>
          recp === rootState.tribe.currentTribe.id
        )).reverse()
      return commit('updateProfileStories', communityStories)
    }
  },

  async getAllStories ({ commit, dispatch }) {
    const res = await apollo.query(GET_ALL_STORIES)

    if (res.errors) {
      console.error('error fetching all stories', res)
      commit('updateStories', [])
      return
    }
    commit('updateStories', res.data.stories)
    dispatch('setProfileStories')
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
