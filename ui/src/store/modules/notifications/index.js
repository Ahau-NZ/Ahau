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
    const res = await apollo.query({
      query: LIST_GROUP_APPLICATIONS,
      fetchPolicy: 'no-cache'
    })
    const formatedNotification = []
    res.data.listGroupApplications.forEach(a => {
      if (a.group.public.length > 0) {
        var noti = {
          type: a.comments.length < 2 ? 'registration' : 'response',
          message: {
            outcome: a.accepted ? 'accepted' : 'not responded',
            group: a.group.public[0],
            groupAdmins: a.group.public[0].tiaki,
            profile: a.applicant,
            comments: a.comments.map(i => i.text)
          },
          applicationId: a.id,
          from: a.applicant,
          accepted: a.accepted
        }
        formatedNotification.push(noti)
      }
    })
    if (res.errors) {
      console.error('error fetching all notifications', res)
      commit('updateNotifications', [])
      return
    }
    commit('updateNotifications', formatedNotification)
  },
  setCurrentNotification ({ commit }, notification) {
    commit('updateCurrentNotification', notification)
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
