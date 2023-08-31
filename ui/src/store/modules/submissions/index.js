import omit from 'lodash.omit'
import pick from 'lodash.pick'

import {
  proposeNewGroupPerson,
  proposeEditGroupPerson,
  getSubmissions,
  approveEditGroupPersonSubmission,
  rejectSubmission,
  proposeNewWhakapapaLink,
  createSubmissionsLink,
  tombstoneSubmission,
  approveSubmission,
  approveNewWhakapapaLink
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
    async proposeNewGroupPerson ({ dispatch, rootGetters }, { input, comment }) {
      try {
        const res = await apollo.mutate(
          proposeNewGroupPerson({
            input,
            comment,
            groupId: rootGetters['tribe/tribeId']
          })
        )

        if (res.errors) throw res.errors

        dispatch('alerts/showMessage', 'Submitted for review', { root: true })

        // submissionId
        return res.data.proposeNewGroupPerson
      } catch (err) {
        const message = 'Something went wrong while trying to create a submission to create a profile'
        dispatch('alerts/showError', message, { root: true })

        console.error(message)
        console.error(err)
      }
    },
    async proposeNewWhakapapaLink ({ dispatch, rootGetters }, { input, comment }) {
      try {
        const res = await apollo.mutate(
          proposeNewWhakapapaLink({
            input,
            comment,
            groupId: rootGetters['tribe/tribeId']
          })
        )

        if (res.errors) throw res.errors

        // submissionId
        return res.data.proposeNewWhakapapaLink
      } catch (err) {
        const message = 'Something went wrong while trying to create a submission to create a link'
        dispatch('alerts/showError', message, { root: true })

        console.error(message)
        console.error(err)
      }
    },
    async createSubmissionsLink ({ dispatch }, { parent, child, mappedDependencies }) {
      try {
        const res = await apollo.mutate(
          createSubmissionsLink({
            parent,
            child,
            mappedDependencies
          })
        )

        if (res.errors) throw res.errors
      } catch (err) {
        const message = 'Something went wrong while trying to create the submission'
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
        // eslint-disable-next-line no-console
        console.error('Something went wrong while trying to get all submissions', err)
      }
    },

    /*
    NOTE: because this method will be used with web registrations, we are using createPerson instead of executeAndApprove
    as it provides more support for admin-only fields
    */
    async approveNewGroupPersonSubmission ({ dispatch }, submission) {
      const submissionId = submission.id

      try {
        const profileInput = {
          type: 'person',
          ...(submission.allowedFields || {}),
          authors: {
            add: ['*']
          },
          recps: submission.recps
        }

        const profileId = await dispatch('person/createPerson', profileInput, { root: true })
        const res = await apollo.mutate(
          approveSubmission({
            id: submissionId,
            comment: submission.comment,
            targetId: profileId
          })
        )

        if (res.errors) throw res.errors

        return submissionId
      } catch (err) {
        const message = 'Something went wrong while trying to approve the submission'
        dispatch('alerts/showError', message, { root: true })

        // eslint-disable-next-line no-console
        console.error(message, submissionId, err)
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
    async approveWhakapapaLinkSubmission (_, input) {
      try {
        if (input.allowedFields.legallyAdopted === null) delete input.allowedFields.legallyAdopted

        const res = await apollo.mutate(
          approveNewWhakapapaLink(input)
        )

        if (res.errors) throw res.errors

        return input.id
      } catch (err) {
        console.error('Something went wrong while trying to approve whakapapa link submission', input.id, err)
      }
    },
    async approveWhakapapaLinkSubmissions ({ dispatch }, submissions) {
      // NOTE: approveWhakapapaLink submission will automatically handle
      // plugging in the ID for the missing parent or child field
      return Promise.all(
        submissions.map(async submission => {
          return dispatch('approveWhakapapaLinkSubmission', {
            id: submission.id,
            allowedFields: pick(submission.details, ['parent', 'child', 'legallyAdopted', 'relationshipType', 'recps'])
          })
        })
      )
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
  }

  return {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
  }
}
