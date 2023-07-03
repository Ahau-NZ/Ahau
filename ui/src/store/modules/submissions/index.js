import omit from 'lodash.omit'

import {
  // proposeNewGroupPerson,
  proposeEditGroupPerson,
  getSubmissions,
  approveEditGroupPersonSubmission,
  rejectSubmission,
  tombstoneSubmission
} from './apollo-helpers'

export default function (apollo) {
  const state = {
  }

  const getters = {
  }

  const mutations = {
  }

  const actions = {
    async proposeEditGroupPerson ({ dispatch, rootGetters }, { profileId, input, comment }) {
      try {
        if (!profileId) throw new Error('a profile id is required to create a submission to update the profile')

        const res = await apollo.mutate(
          proposeEditGroupPerson({
            profileId,
            input: omit(input, ['id', 'recps']),
            comment,

            groupId: rootGetters['tribe/tribeId']
          })
        )

        if (res.errors) throw res.errors

        // submissionId
        return res.data.proposeEditGroupPerson
      } catch (err) {
        const message = 'Something went wrong while trying to create a submission to update the profile'
        dispatch('alerts/showError', message, { root: true })

        // eslint-disable-next-line no-console
        console.error(message, err)
      }
    },
    async getSubmissions () {
      try {
        const res = await apollo.query(
          getSubmissions
        )

        if (res.errors) throw res.errors

        return res.data.getSubmissions
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Something went wrong while trying to get all submissions', err)
      }
    },
    async approveEditGroupPersonSubmission (_, input) {
      try {
        const res = await apollo.mutate(
          approveEditGroupPersonSubmission(input)
        )
        if (res.errors) throw res.errors

        return input.id
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Something went wrong while trying to approve submission', input.id, err)
      }
    },
    async rejectSubmission (_, input) {
      try {
        const res = await apollo.mutate(
          rejectSubmission(input)
        )
        if (res.errors) throw res.errors

        return input.id
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Something went wrong while trying to reject submission', input.id, err)
      }
    },
    async tombstoneSubmission ({ dispatch }, id) {
      try {
        const res = await apollo.mutate(
          tombstoneSubmission(id)
        )
        if (res.errors) throw res.errors

        dispatch('alerts/showMessage', 'The submission was deleted', { root: true })
      } catch (err) {
        const message = 'Something went wrong while trying to delete the submission'
        console.error(message, err)
        dispatch('alerts/showError', message, { root: true })
      }
    }
    // async proposeNewGroupPerson ({ dispatch }, { input, comment, recps }) {
    //   try {
    //     const res = await apollo.mutate(
    //       proposeNewGroupPerson({
    //         input,
    //         comment,
    //         recps
    //       })
    //     )

    //     if (res.errors) throw res.errors

    //     dispatch('alerts/showMessage', 'Submitted for review', { root: true })

    //     // submissionId
    //     return res.data.proposeNewGroupPerson
    //   } catch (err) {
    //     const message = 'Something went wrong while trying to create a submission to create a profile'
    //     dispatch('alerts/showError', message, { root: true })

    //     console.error(message)
    //     console.error(err)
    //   }
    // }
  }

  return {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
  }
}
