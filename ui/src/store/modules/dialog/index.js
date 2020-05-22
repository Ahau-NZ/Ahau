// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

const state = {
  dialog: null,
  preview: false
}

const getters = {
  storeDialog: state => {
    return state.dialog
  },
  previewProfile: state => {
    return state.preview
  }
}

const mutations = {
  updateDialog (state, dialog) {
    state.dialog = dialog
  },
  updatePreview (state, preview) {
    state.preview = preview
  }
}

const actions = {
  setDialog ({ commit }, dialog) {
    if (dialog === null) {
      commit('updateDialog', dialog)
      commit('updatePreview', false)
    } else if (typeof dialog === 'object') {
      commit('updateDialog', dialog.active)
      commit('updatePreview', dialog.preview)
    } else {
      commit('updateDialog', dialog)
    }
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
