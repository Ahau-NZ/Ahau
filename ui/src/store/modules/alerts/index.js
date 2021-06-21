/*
  TODO (later):
  - [ ] separate alerts into two sections
    - [ ] confirmation message
    - [ ] error message
  - [ ] different message types will use different styling
  - [ ] update the error message styling, temporarily red for now
  - [ ] use alerts in all graphql query catches, display something when it fails
  - [ ] add confirmation messages when successfully performing operations (save/submit/update/create)
*/

const state = {
  alert: {
    settings: {
      show: false,
      message: null,
      color: ''
    }
  }
}

const getters = {
  alert: state => state.alert,
  alertSettings: state => state.alert.settings
}

const mutations = {
  showAlert (state, { message, delay = 3000, color = '' }) {
    state.alert.settings = {
      show: true,
      message,
      color
    }

    setTimeout(() => {
      state.alert.settings = {
        show: false,
        message: null,
        color: null
      }
    }, delay)
  }
}

const actions = {
  showError ({ commit }, message = 'Sorry! An error occurred!') {
    commit('showAlert', { message, delay: 5000, color: 'red' })
  },
  showMessage ({ commit }, message = 'Success!') {
    commit('showAlert', { message, color: 'green' })
  }
}

export default {
  state,
  mutations,
  actions,
  getters,
  namespaced: true
}
