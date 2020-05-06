// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'
import actions from './actions'

const state = {
  nestedWhakapapa: {}
}

const getters = {
  nestedWhakapapa: state => {
    return state.nestedWhakapapa
  }
}

const mutations = {
  setNestedWhakapapa (state, nestedWhakapapa) {
    state.nestedWhakapapa = nestedWhakapapa
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
