// Identity state
import { getAllCredentials } from './atala-helpers'

export default function (apollo) {
  const state = {
    credentials: []
  }

  const getters = {
    credentials: state => {
      return state.credentials
    }
  }

  const mutations = {
    setCredentials (state, credentials) {
      state.credentials = credentials
    }
  }

  const actions = {
    async getAllCredentials ({ commit, dispatch, state }) {
      // get all credentials
      const credentials = await apollo.query(getAllCredentials)
        .catch(err => {
          if (err)console.error('error getting credentials ' + err)
        })
      console.log({ credentials })
      commit('setCredentials', credentials.data.verifiableCredentials)
    }
  }

  return {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
  }
}
