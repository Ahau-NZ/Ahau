// import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { getTribes } from '@/lib/community-helpers'
import { getTribeIds } from './apollo-helpers'

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
  async getTribes ({ commit }) {
    try {
      const res = await apollo.query(getTribes)

      if (res.errors) throw res.errors

      commit('updateTribes', res.data.tribes)

      return res.data.tribes
    } catch (err) {
      console.error('Failed to get tribes', err)
      return []
    }
  },
  async getTribeIds () {
    try {
      const res = await apollo.query(getTribeIds)

      if (res.errors) throw res.errors

      return res.data.listGroups.map(d => d.id)
    } catch (err) {
      console.error('failed to get group ids', err)
      return []
    }
  }
}

export default {
  state,
  mutations,
  actions,
  getters,
  namespaced: true
}
