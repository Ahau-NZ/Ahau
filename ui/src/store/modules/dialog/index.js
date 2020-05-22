// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

const state = {
  dialog: null
}

const getters = {
  thisDialog: state => {
    return state.dialog
  }
}

const mutations = {
  updateDialog (state, dialog) {
    state.dialog = dialog
  }
}

const actions = {
  setDialog ({ commit }, dialog) {
    console.log('setting dialog', dialog)
    commit('updateDialog', dialog)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
