// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'
import getRelatives from '@/lib/profile-helpers'
import tree from '@/lib/tree-helpers'

const state = {
  selectedProfile: {}
}

const getters = {
  selectedProfile: state => {
    return state.selectedProfile
  }
}

const mutations = {
  updateProfile (state, profile) {
    state.selectedProfile = profile
  }
}

const actions = {
  setProfile ({ commit }, person) {
    commit('updateProfile', person)
  },
  async setProfileById ({ commit, rootState, dispatch }, id) {
    console.log('rootState: ', rootState)
    if (id === rootState.whoami.profile.id) {
      dispatch('setWhoami', id)
    }
    if (rootState.dialog.dialog) {
      dispatch('setDialog', null)
    }
    var person = await getRelatives(id)
    if (person.children) {
      person.children = await Promise.all(person.children.map(async (child) => {
        const childProfile = await getRelatives(child.profile.id)
        person = tree.getPartners(person, childProfile)
        return childProfile
      }))
    }
    if (person.parents) {
      person.parents = await Promise.all(person.parents.map(async parent => {
        const parentProfile = await getRelatives(parent.profile.id)
        person = tree.getSiblings(parentProfile, person)
        return parentProfile
      }))
      commit('updateProfile', person)
    }
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
