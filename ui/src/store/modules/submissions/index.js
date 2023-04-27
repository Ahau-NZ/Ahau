import omit from 'lodash.omit'

import {
  // proposeNewGroupPerson,
  proposeEditGroupPerson,
  getSubmissions,
  approveSubmission,
  rejectSubmission
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
            recps: [rootGetters.currentAccess.groupId]
          })
        )

        if (res.errors) throw res.errors

        // submissionId
        return res.data.proposeEditGroupPerson
      } catch (err) {
        const message = 'Something went wrong while trying to create a submission to update the profile'
        dispatch('alerts/showError', message, { root: true })

        console.error(message)
        console.error(err)
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
        console.error('Something went wrong while trying to get all submissions', err)
      }
    },
    async approveSubmission (_, input) {
      try {
        const res = await apollo.mutate(
          approveSubmission(input)
        )
        if (res.errors) throw res.errors

        return input.id
      } catch (err) {
        console.error('Something went wrong while trying to approve the submission', input.id)
        console.error(err)
      }
    },
    async rejectSubmission (_, input) {
      console.log(input)
      try {
        const res = await apollo.mutate(
          rejectSubmission(input)
        )
        if (res.errors) throw res.errors

        return input.id
      } catch (err) {
        console.error('Something went wrong while trying to reject the submission', input.id)
        console.error(err)
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
