// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'
import getRelatives from '@/lib/profile-helpers'
import tree from '@/lib/tree-helpers'

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
  async setProfileById ({ commit, rootState, dispatch }, { id, type }) {
    console.log('setting profile')
    if (id === rootState.whoami.profile.id) {
      dispatch('setWhoami', id)
    }
    if (type !== 'setWhanau' && rootState.dialog.dialog) {
      dispatch('setDialog', null)
    }
    var person = await getRelatives(id)
    if (person.children) {
      person.children = await Promise.all(person.children.map(async (child) => {
        var childProfile = await getRelatives(child.profile.id)
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
        var parentProfile = await getRelatives(parent.profile.id)
        person = tree.getSiblings(parentProfile, person)
        if (parentProfile.parents) {
          person.grandparents = parentProfile.parents.map(grandparent => {
            return grandparent.profile
          })
        }
        parentProfile = {
          ...parentProfile,
          relationshipType: parent.relationshipType
        }
        return parentProfile
      }))
    }
    if (!type) commit('updateCurrentProfile', person)
    commit('updateSelectedProfile', person)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
