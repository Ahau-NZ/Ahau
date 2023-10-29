import { listGroupApplications } from '@/lib/tribes-application-helpers'

export default function (apollo) {
  const state = {
    applications: [],
    currentNotification: {}
  }

  const getters = {
    currentNotification: state => state.currentNotification,
    applications: state => state.applications,
    submissions: (state, getters, rootState, rootGetters) => {
      return rootGetters['submissions/submissions']
        .map(mapSubmissionValues(rootState.whoami))
    },
    notifications: (state, getters) => {
      return [...getters.applications, ...getters.submissions]
    }
  }

  const mutations = {
    updateApplications (state, applications) {
      state.applications = applications
    },
    updateNotifications (state, notifications) {
      state.notifications = notifications
    },
    updateCurrentNotification (state, notification) {
      state.currentNotification = notification
    }
  }

  const actions = {
    async listGroupApplications ({ commit, rootState }) {
      try {
        const res = await apollo.query(
          listGroupApplications()
        )

        if (res.errors) throw res.errors

        const { unseen, accepted, declined } = res.data

        const applications = [...unseen, ...accepted, ...declined]
          .map(mapValues(rootState.whoami))
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
      await dispatch('submissions/loadSubmissions', null, { root: true })
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

function mapSubmissionValues (whoami) {
  return function (submission) {
    const {
      id,
      // targetId,
      targetType,

      targetRecord,
      sourceRecord,
      source,
      comments,
      approvedByIds,
      rejectedByIds,
      applicant,
      applicantId,
      details,
      group,
      answers,
      dependencies
    } = submission

    const isPersonal = applicantId === whoami.public.feedId

    const isNew = approvedByIds?.length === 0 && rejectedByIds?.length === 0
    const isAccepted = approvedByIds?.length > 0
      ? true
      : rejectedByIds.length > 0
        ? false
        : null

    const from = isPersonal ? whoami.personal.profile : applicant
    const _group = (group && group.public[0]) || null

    return {
      type: 'submission',
      targetType,
      from,
      applicant,
      id,

      group: _group,
      rawGroup: group,

      // status
      isNew,
      isAccepted,

      // information
      isPersonal,
      changes: details,

      targetRecord,
      sourceRecord,
      source,
      answers,
      dependencies,

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
