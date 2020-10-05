// import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { getTribes, getMembers } from '@/lib/community-helpers'

const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

const state = {
  currentTribe: {},
  tribes: []
}

const getters = {
  currentTribe: state => {
    return state.currentTribe
  },
  tribes: state => {
    return state.tribes
  }
}

const mutations = {
  updateCurrentTribe (state, tribe) {
    state.currentTribe = tribe
  },
  updateTribes (state, tribes) {
    state.tribes = tribes
  }
}

const actions = {
  async setCurrentTribe ({ commit }, tribe) {
    const authors = await apollo.query(getMembers(tribe.id))
    if (authors.errors) {
      console.log('failed to get group authors: ', authors)
    }
    const members = authors.data.listGroupAuthors
    const whanau = {
      ...tribe,
      members
    }
    commit('updateCurrentTribe', whanau)
  },
  async setTribes ({ commit }) {
    const tribes = await apollo.query(getTribes)
    if (tribes.errors) {
      console.error('failed to get tribes', tribes)
      return
    }
    commit('updateTribes', tribes.data.tribes)
  },
  async setCurrentTribeById ({ dispatch, rootState }, id) {
    await dispatch('setTribes')
    var tribe = rootState.tribe.tribes.filter(tribe => tribe.private.length > 0).find(tribe => tribe.private[0].id === id)
    dispatch('setCurrentTribe', tribe)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
