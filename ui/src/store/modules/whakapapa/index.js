// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'
import actions from './actions'

const state = {
  nestedWhakapapa: {}
  // whakapapaView: {
  //   id: '',
  //   name: 'Loading',
  //   description: '',
  //   focus: '',
  //   // mode: 'descendants',
  //   recps: null,
  //   image: { uri: '' },
  //   ignoredProfiles: []
  // }
}

const getters = {
  nestedWhakapapa: state => {
    console.log('whakapapa state module')
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
