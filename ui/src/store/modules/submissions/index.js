import { omit, pick } from 'lodash-es'

import {
  proposeNewGroupPerson,
  proposeEditGroupPerson,
  proposeTombstone,
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

        dispatch('alerts/showMessage', 'Submitted for review', { root: true })

        // submissionId
        return res.data.proposeEditGroupPerson
      } catch (err) {
        const message = 'Something went wrong while trying to create a submission to update the profile'
        dispatch('alerts/showError', message, { root: true })

        // eslint-disable-next-line no-console
        console.error(message, err)
      }
    },
    async proposeDeleteGroupPerson ({ dispatch, rootGetters }, { profileId, comment, groupId }) {
      try {
        if (!profileId) throw new Error('a profile id is required to create a submission to delete the profile')

        const res = await apollo.mutate(
          proposeTombstone({
            recordId: profileId,
            comment,
            groupId: rootGetters['tribe/tribeId']
          })
        )

        if (res.errors) throw res.errors

        dispatch('alerts/showMessage', 'Submitted for review', { root: true })

        // submissionId
        return res.data.proposeTombstone
      } catch (err) {
        const message = 'Something went wrong while trying to create a submission to delete the profile'
        dispatch('alerts/showError', message, { root: true })

        // eslint-disable-next-line no-console
        console.error(message, err)
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

        await dispatch('approveSubmission', {
          id: submissionId,
          comment: submission.comment,
          targetId: profileId
        })

        dispatch('alerts/showMessage', 'The submission was approved and the profile was created', { root: true })

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
    async approveDeleteGroupPersonSubmission ({ dispatch }, input) {
      const { id, comment, profileId } = input
      try {
        const targetId = await dispatch('person/deletePerson', { id: profileId }, { root: true })
        dispatch('whakapapa/removeLinksToProfile', profileId, { root: true })

        await dispatch('approveSubmission', {
          id,
          comment,
          targetId
        })

        dispatch('alerts/showAlert', {
          message: 'The submission was approved and the profile was deleted',
          delay: 10000,
          color: 'green'
        }, { root: true })

        return id
      } catch (err) {
        const message = 'Something went wrong while trying to approve the submission'
        dispatch('alerts/showError', message, { root: true })

        // eslint-disable-next-line no-console
        console.error(message, id, err)
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
    async approveSubmission (_, input) {
      const { id } = input
      try {
        const res = await apollo.mutate(
          approveSubmission(input)
        )

        if (res.errors) throw res.errors

        return id
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Something went wrong while trying to reject submission', input.id, err)
      }
    },
    async rejectSubmission ({ dispatch }, input) {
      try {
        const res = await apollo.mutate(
          rejectSubmission(input)
        )
        if (res.errors) throw res.errors

        dispatch('alerts/showMessage', 'The submission was rejected and no changes were made', { root: true })

        return input.id
      } catch (err) {
        const message = 'Something went wrong while trying to reject the submission'
        dispatch('alerts/showError', message, { root: true })

        // eslint-disable-next-line no-console
        console.error(message, input.id, err)
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
