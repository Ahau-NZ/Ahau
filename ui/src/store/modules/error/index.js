// parts of the Error notification system:
//
// 1. src/store/modules/error/index.js
//    - handles notification actions
//      - setError, clearError
//      - setShowError (to expand snack > dialog with full detail)
//
// 2. src/store/index.js
//    - defines apollo.niceQuery and apollo.niceMutate which do the query/mutate,
//      but catch errors and channel them to (1)
//    - e.g. (search codease for example)
//
// 3. src/components/Error.vue
//    - listens to store, showing snackbar/ dialog

const state = {
  error: null,
  message: null,
  showError: false
}

const getters = {
  error: state => state.error,
  showErrorSnack: state => state.error && !state.showError,
  showErrorDialog: state => state.error && state.showError,
  message: state => state.error && state.message,
  details: state => state.error && (state.error.details || errorDetails(state.error))
}
function errorMessage (error) {
  return error && (error.message || 'Unknown Error')
}
function errorDetails (error) {
  return (
    error.stack ||
    JSON.stringify(error, null, 2)
  )
}

const mutations = {
  setError (state, info) {
    state.showError = false

    if (info.error && info.message) {
      state.error = info.error
      state.message = info.message
    } // eslint-disable-line
    else {
      state.error = info
      state.message = errorMessage(info)
    }
    console.error(info)
  },
  setShowError (state, bool = true) {
    state.showError = Boolean(bool)
  },
  clearError (state) {
    state.error = null
    state.showError = false
  }
}

const actions = {
  setError ({ commit }, error) { commit('setError', error) },
  setNetworkError ({ commit }, error) { commit('setError', { message: 'Network Error', error }) },
  setGraphqlError ({ commit }, error) { commit('setError', { message: 'Graphql Error', error }) },
  setShowError ({ commit }, bool) { commit('setShowError', bool) },
  clearError ({ commit }) { commit('clearError') }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
