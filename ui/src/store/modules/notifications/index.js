// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

const state = {
  notifications: [],
  currentNotification: {}
}

const getters = {
  notifications: state => {
    return state.notifications
  },
  currentNotification: state => {
    return state.currentNotification
  }
}

const mutations = {
  updateNotifications (state, notifications) {
    state.notifications = notifications
  },
  updateCurrentNotification (state, notification) {
    state.currentNotification = notification
  }
}

const actions = {
  setCurrentNotification ({ commit }, notification) {
    commit('updateCurrentNotification', notification)
  },
  setNotifications ({ commit, rootState }, notifications) {
    var dummyNotifications = [
      {
        type: 'registration',
        message: {
          community: rootState.whoami.personal.profile,
          profile: rootState.person.currentProfile,
          message: 'Hello my name is Ben, I was born in Australia and havent been home yet, so I am excited to learn more baout who I am and where I come from'
        },
        from: rootState.whoami.personal.profile
      },
      {
        type: 'response',
        message: {
          outcome: 'approved',
          community: rootState.whoami.personal.profile,
          message: 'Kia ora Ben, so awesome that you have joined. We dont current have any information about your family on the whakapapa record so it would be awesome if you can add any some information about your mum and siblings (if you have any)'
        },
        from: rootState.whoami.personal.profile
      },
      {
        type: 'response',
        message: {
          outcome: 'declined',
          community: rootState.whoami.personal.profile,
          message: 'Kia ora Ben, Aroha mai. Im sorry I cant find any whakapapa connection to our whānau for your parents or grandparents names that you have provided. Please give me a call on 0226990253 so we can talk and see if we can make the connection.'
        },
        from: rootState.whoami.personal.profile
      }
    ]
    commit('updateNotifications', dummyNotifications)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
