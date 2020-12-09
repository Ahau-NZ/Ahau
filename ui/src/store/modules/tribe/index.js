// import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { getTribes } from '@/lib/community-helpers'

const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

const state = {
  tribes: []
}

const getters = {
  tribes: state => {
    return state.tribes
  }
}

const mutations = {
  updateTribes (state, tribes) {
    state.tribes = tribes
  }
}

const actions = {
  async setTribes ({ commit }) {
    let tribes
    try {
      tribes = await apollo.query(getTribes)

      if (tribes.errors) throw tribes.errors

      commit('updateTribes', tribes.data.tribes)
    } catch (err) {
      console.error('Failed to get tribes', tribes)
    }
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
