import { apolloProvider } from '@/plugins/vue-apollo'
import { getRelatives } from '@/lib/person-helpers'
import tree from '@/lib/tree-helpers'

const apollo = apolloProvider.defaultClient

const state = {
  selectedProfile: {},
  currentProfile: {}
}

const getters = {
  selectedProfile: state => {
    return state.selectedProfile
  },
  currentProfile: state => {
    return state.currentProfile
  }
}

const mutations = {
  updateSelectedProfile (state, profile) {
    state.selectedProfile = profile
  },
  updateCurrentProfile (state, profile) {
    state.currentProfile = profile
  }
}

const actions = {
  async setProfile ({ commit, dispatch }, profile) {
    await commit('updateCurrentProfile', profile)
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
    if (person.children) {
      person.children = await Promise.all(person.children.map(async (child) => {
        var childProfile = await getRelatives(child.profile.id, apollo)
        childProfile = {
          ...childProfile,
          relationshipType: child.relationshipType
        }
        person = tree.getPartners(person, childProfile)
        return childProfile
      }))
    }
    if (person.parents) {
      person.parents = await Promise.all(person.parents.map(async parent => {
        var parentProfile = await getRelatives(parent.profile.id, apollo)
        person = tree.getSiblings(parentProfile, person)
        parentProfile = {
          ...parentProfile,
          relationshipType: parent.relationshipType
        }
        return parentProfile
      }))
    }
    if (!type) {
      await commit('updateCurrentProfile', person)
    }
    commit('updateSelectedProfile', person)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
