import { listGroupApplications } from '@/lib/tribes-application-helpers'

export default function (apollo) {
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

        const { unseen, accepted, declined } = res.data

        const applications = [...unseen, ...accepted, ...declined]
          .map(mapValues(whoami))
          .filter(n => n.group)
          .reverse()

        commit('updateNotifications', applications)
      } catch (err) {
        console.error('Something went wrong while trying to get all group applications', err)
      }
    },
    setCurrentNotification ({ commit }, notification) {
      commit('updateCurrentNotification', notification)
    }
  }

  return {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
  }
}

function mapValues (whoami) {
  return function (application) {
    const { decision, applicant, applicantId, group, answers, history } = application

    const isPersonal = applicantId === whoami.public.feedId
    const isNew = decision === null
    const isAccepted = (decision && decision.accepted) || false
    // defaults to false as currently only join requests are mapped
    const isSubmission = false
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
      isSubmission,
      isNew
    }
  }
}
