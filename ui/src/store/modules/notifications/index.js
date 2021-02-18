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
  async getAllNotifications ({ commit, rootState: { whoami } }) {
    try {
      const res = await apollo.query(
        listGroupApplications()
      )

      if (res.errors) throw res.errors

      const formattedNotification = []

      // TODO: currently a bug here
      res.data.listGroupApplications.forEach(application => {
        if (application.group.public.length > 0) { // TODO: why do we have to check this?
          var notification = {
            message: {
              outcome: (application.decision === null)
                ? 'not responded'
                : application.decision.accepted
                  ? 'accepted'
                  : 'declined',
              comments: application.history.filter(history => history.type === 'comment').map(history => history.comment)
            },
            groupAdmins: application.groupAdmins,
            applicationId: application.id,
            applicant: application.applicant,
            group: application.group.public[0],
            accepted: application.decision === null ? null : application.decision.accepted,
            isPersonalApplication: application.applicant.id === whoami.public.profile.id
          }
          formattedNotification.push(notification)
        }
      })

      commit('updateNotifications', formattedNotification)
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
