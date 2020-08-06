// import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { getTribes } from '@/lib/community-helpers'

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
  setCurrentTribe ({ commit }, tribe) {
    commit('updateCurrentTribe', tribe)
  },
  async setTribes ({ commit }) {
    const tribes = await apollo.query(getTribes)
    if (tribes.errors) {
      console.error('failed to get tribes', tribes)
      return
    }
    commit('updateTribes', tribes.data.tribes)
  },
  async setCurrentTribeById ({ commit, dispatch, rootState }, id) {
    await dispatch('setTribes')
    var tribe = rootState.tribe.tribes.filter(tribe => tribe.private.length > 0).find(tribe => tribe.private[0].id === id)
    commit('updateCurrentTribe', tribe)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
