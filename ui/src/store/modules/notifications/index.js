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

      var { unseen, accepted, declined } = res.data

      unseen = unseen.map(application => mapValues(application, whoami))
      accepted = accepted.map(application => mapValues(application, whoami))
      declined = declined.map(application => mapValues(application, whoami))

      const notifs = [...unseen, ...accepted, ...declined]
        .filter(n => n.group)
        .reverse()

      commit('updateNotifications', notifs)
    } catch (err) {
      console.error('Something went wrong while trying to get all group applications', err)
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

function mapValues (application, whoami) {
  const { decision, applicant, applicantId, group, answers, history } = application

  const isPersonal = applicantId === whoami.public.feedId
  const isNew = decision === null
  const isAccepted = (decision && decision.accepted) || false
  const _group = (group && group.public[0]) || null

  // TODO: not sure which admin, find out later: look at the history instead
  const from = isPersonal ? whoami.personal.profile : applicant

  return {
    from,
    group: _group,
    applicant: applicant || null,
    id: application.id,
    answers,
    history,
    isPersonal,
    isAccepted,
    isNew
  }
}
