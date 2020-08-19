// import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { LIST_GROUP_APPLICATIONS } from '@/lib/tribes-application-helpers'
const apolloProvider = createProvider()
const apollo = apolloProvider.defaultClient

const POLL_INTERVAL = 5000

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

async function fetchAllNotifications (commit) {
  const res = await apollo.query({ query: LIST_GROUP_APPLICATIONS })
  const formatedNotification = res.data.listGroupApplications.map(a => ({
    type: a.comments.length < 2 ? 'registration' : 'response',
    message: {
      outcome: a.accepted ? 'accepted' : 'not responded',
      group: a.group.public[0],
      groupAdmins: a.group.public[0].tiaki,
      profile: a.applicant,
      message: a.text ? a.text[a.text.length - 1] : ''
    },
    applicationId: a.id,
    from: a.applicant,
    accepted: a.accepted
  }))
  if (res.errors) {
    console.error('error fetching all notifications', res)
    commit('updateNotifications', [])
    return
  }
  commit('updateNotifications', formatedNotification)
}

const actions = {
  async getAllNotifications ({ commit }) {
    await fetchAllNotifications(commit)
    setInterval(() => {
      fetchAllNotifications(commit)
    }, POLL_INTERVAL)
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
