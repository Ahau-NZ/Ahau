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
        listGroupApplications(null)
      )

      if (res.errors) throw res.errors

      const formattedNotification = []

      // NULL
      // answers: []
      // applicant: {…}
      // decision: null
      // group: {id: "%Idl/JumtnNqW4SRvNNEj0u7lnawO43YpxQekRqxMxQs=.cloaked", public: Array(1), private: Array(1), __typename: "TribeFaces"}
      // groupAdmins: [{…}, __ob__: Observer]
      // history: (2) [{…}, {…}] // { comment }, { answers }
      // id: "%LN0JWIBd+WSPLGIvVApGxmExfqLdlMCNips/+7F/zyA=.sha256"
      // __typename: "GroupApplication"

      // TRUE
      // answers: (3) [{…}, {…}, {…}]
      // applicant: {…}
      // decision: {accepted: true, __typename: "GroupApplicationDecision"}
      // group: {id: "%Ez17jq5Gl/Ih92M2gp4kfEYuXyRJujDLlc/j3wOBu4M=.cloaked", public: Array(1), private: Array(1), __typename: "TribeFaces"}
      // groupAdmins: [{…}, __ob__: Observer]
      // history: (4) [{…}, {…}, {…}, {…}]
      // id: "%J2YMOWiVJjdHM4R80Z7AQ7IIZ1N2bsr4SdoOKUSas/Y=.sha256"
      // __typename: "GroupApplication"

      // FALSE
      // TODO

      // TODO: currently a bug here
      res.data.listGroupApplications.forEach(application => {
        if (application.group.public.length > 0) { // TODO: why do we have to check this?
          var notification = {
            type: application.history.length < 2 ? 'registration' : 'response',
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
            accepted: application.decision === null ? null : application.decision.accepted
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
