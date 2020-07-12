// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

const state = {
  dialog: null,
  type: false,
  source: null
}

const getters = {
  storeDialog: state => {
    return state.dialog
  },
  storeType: state => {
    return state.type
  },
  storeSource: state => {
    return state.source
  }
}

const mutations = {
  updateDialog (state, dialog) {
    state.dialog = dialog
  },
  updateType (state, type) {
    state.type = type
  },
  updateSource (state, source) {
    state.source = source
  }
}

const actions = {
  setDialog ({ commit }, dialog) {
    if (dialog === null) {
      commit('updateDialog', dialog)
      commit('updateType', false)
    } else if (typeof dialog === 'object') {
      commit('updateDialog', dialog.active)
      commit('updateType', dialog.type)
      commit('updateSource', dialog.source)
    } else {
      commit('updateDialog', dialog)
    }
  }
  // setDialog ({ commit }, dialog) {
  //   console.log("setDialog: ", dialog, type, source)
  //   commit('updateDialog', dialog)
  //   if (type) commit('updateType', type)
  //   if (source) commit('updateSource', source)
  // }
}

export default {
  state,
  mutations,
  actions,
  getters
}
