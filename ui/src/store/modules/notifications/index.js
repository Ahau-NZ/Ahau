// import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { listGroupApplications } from '@/lib/tribes-application-helpers'
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
    try {
      const res = await apollo.query(
        listGroupApplications()
      )

      if (res.errors) throw res.errors

      const formatedNotification = []

      // TODO: currently a bug here
      res.data.listGroupApplications.forEach(application => {
        if (application.group.public.length > 0) {
          var notification = {
            type: application.history.length < 2 ? 'registration' : 'response',
            message: {
              outcome: (application.decision === null)
                ? 'not responded'
                : application.decision.accepted
                  ? 'accepted'
                  : 'declined',
              group: application.group.public[0],
              groupAdmins: application.groupAdmins,
              profile: application.applicant,
              comments: application.history.filter(history => history.type === 'comment').map(history => history.comment)
            },
            applicationId: application.id,
            from: application.applicant,
            accepted: application.decision ? application.decision.accepted : false
          }
          formatedNotification.push(notification)
        }
      })

      commit('updateNotifications', formatedNotification)
    } catch (err) {
      console.error('Something went wrong while try to get all group applications', err)
    }
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
