import { listGroupApplications } from '@/lib/tribes-application-helpers'

export default function (apollo) {
  const state = {
    applications: [],
    submissions: [],
    currentNotification: {}
  }

  const getters = {
    currentNotification: state => state.currentNotification,
    applications: state => state.applications,
    submissions: state => state.submissions,
    notifications: (state, getters) => {
      return [...getters.applications, ...getters.submissions]
    }
  }

  const mutations = {
    updateApplications (state, applications) {
      state.applications = applications
    },
    updateSubmissions (state, submissions) {
      state.submissions = submissions
    },
    updateNotifications (state, notifications) {
      state.notifications = notifications
    },
    updateCurrentNotification (state, notification) {
      state.currentNotification = notification
    }
  }

  const actions = {
    async listSubmissions ({ commit, dispatch, rootState: { whoami } }) {
      const submissions = (await dispatch('submissions/getSubmissions', null, { root: true }))
        .map(mapSubmissionValues(whoami))

      commit('updateSubmissions', submissions)

      return submissions
    },
    async listGroupApplications ({ commit, rootState: { whoami } }) {
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

        commit('updateApplications', applications)

        return applications
      } catch (err) {
        console.error('Something went wrong while trying to get all group applications', err)
      }
    },
    async getAllNotifications ({ dispatch }) {
      await dispatch('listGroupApplications')
      await dispatch('listSubmissions')
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

    const _group = (group && group.public[0]) || null

    // TODO: not sure which admin, find out later: look at the history instead
    const from = isPersonal ? whoami.personal.profile : applicant
    return {
      type: 'application',
      from,
      applicant: applicant || null,

      group: _group,
      id: application.id,
      answers,
      history,
      isPersonal,

      // status
      isAccepted,
      isNew
    }
  }
}

// similar to mapValues but for submissions
function mapSubmissionValues (whoami) {
  return function (submission) {
    const {
      id,
      // targetId,
      // targetType,

      target,
      comments,
      approvedBy,
      rejectedBy,
      applicant,
      applicantId,
      details,
      group
    } = submission

    const isPersonal = applicantId === whoami.public.feedId

    const isNew = approvedBy?.length === 0 && rejectedBy?.length === 0
    const isAccepted = approvedBy?.length > 0
      ? true
      : rejectedBy.length > 0
        ? false
        : null

    const _group = (group && group.public[0]) || null

    const from = isPersonal ? whoami.personal.profile : applicant

    return {
      type: 'submission',
      from,
      applicant,
      id,

      group: _group,

      // status
      isNew,
      isAccepted,

      // information
      isPersonal,
      changes: details,

      target,

      history: comments.map(({ authorId, author, comment }) => {
        return {
          type: 'comment',
          authorId,
          author,
          comment
        }
      })
    }
  }
}
