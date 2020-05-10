// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'
import getRelatives from '@/lib/profile-helpers'
import tree from '@/lib/tree-helpers'
/*
  this is needed in order to run queries and mutations
  TODO: is this okay?
// */
// const apolloProvider = createProvider()
// const apolloClient = apolloProvider.defaultClient

/*
  holds current value of the artefact state
*/
const state = {
  selectedProfile: {}
}

/*
  these map getters to whats in the state, then we can use those getters
  within components
*/
const getters = {
  selectedProfile: state => {
    return state.selectedProfile
  }
}

/*
  These are what makes changes to the state
*/
const mutations = {
  updateProfile (state, profile) {
    state.selectedProfile = profile
  }
}

/*
  These do not like directly change the state, but they commit mutations (changes),
  which make changes to the state
*/
const actions = {
  setProfile ({ commit }, person) {
    commit('updateProfile', person)
  },
  async setProfileById ({ commit }, id) {
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
