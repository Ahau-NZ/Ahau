// import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { LIST_GROUP_APPLICATIONS } from '@/lib/tribes-application-helpers'
const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

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
  async getAllNotifications ({ commit }) {
    const res = await apollo.query({ query: LIST_GROUP_APPLICATIONS })
    const formatedNotification = res.data.listGroupApplications.map(a => ({
      type: 'registration',
      message: {
        community: a.group,
        profile: a.applicant,
        message: a.text ? a.text[a.text.length - 1] : ''
      },
      from: a.applicant
    }))
    if (res.errors) {
      console.error('error fetching all notifications', res)
      commit('updateNotifications', [])
      return
    }
    commit('updateNotifications', formatedNotification)
  },
  setCurrentNotification ({ commit }, notification) {
    commit('updateCurrentNotification', notification)
  },
  async setNotifications ({ commit, rootState }, notifications) {
    commit('updateNotifications', notifications)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
