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

      /*
        different types of applications include:
        - pending personal applications - these are applications you've sent that are pending approval
        - joining applicantions - these are applications you have received that you havent yet responded to
        - accepted personal appications - these are applications you've sent and they have been accepted
        - accepted other applications - these are applications you have received and accepted
      */

      // TODO: currently a bug here
      res.data.listGroupApplications.forEach(application => {
        if (application.group.public.length > 0) { // TODO: why do we have to check this?
          const isPersonalApplication = application.applicant.id === whoami.public.profile.id
          const accepted = application.decision === null ? null : application.decision.accepted
          const type = getApplicationType(isPersonalApplication, accepted, application.groupAdmins, application.applicant)

          var notification = {
            ...type,
            history: application.history,
            groupAdmins: application.groupAdmins,
            applicationId: application.id,
            applicant: application.applicant,
            group: application.group.public[0],
            accepted,
            isPersonalApplication
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

// TODO: rename to something more suitable
function getApplicationType (isPersonalApplication, accepted, groupAdmins, applicant) {
  switch (true) {
    case isPersonalApplication && accepted === null: return { type: 'pending', to: groupAdmins[0] }
    case !isPersonalApplication && accepted === null: return { type: 'new', to: applicant }
    case isPersonalApplication && accepted: return { type: 'personal-complete', to: groupAdmins[0] }
    case !isPersonalApplication && accepted: return { type: 'other-complete', to: applicant }
    default: return null
  }
}
