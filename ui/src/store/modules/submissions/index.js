import { omit, pick } from 'lodash-es'

import {
  proposeNewGroupPerson,
  proposeEditGroupPerson,
  proposeTombstone,
  proposeEditWhakapapaView,
  getSubmissions,
  approveEditGroupPersonSubmission,
  rejectSubmission,
  proposeNewWhakapapaLink,
  createSubmissionsLink,
  tombstoneSubmission,
  approveSubmission,
  approveNewWhakapapaLink
} from './apollo-helpers'

import {
  saveWhakapapaView
} from '../whakapapa/lib/apollo-helpers.mjs'

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
    async proposeDeleteGroupPerson ({ dispatch, rootGetters }, { profileId, comment }) {
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
    async proposeEditWhakapapaView ({ dispatch, rootGetters }, { whakapapaId, input, comment }) {
      try {
        if (!whakapapaId) throw new Error('a whakapapa view id is required to create a submission to update a whakapapa view')

        const res = await apollo.mutate(
          proposeEditWhakapapaView({
            whakapapaId,
            input,
            comment,
            groupId: rootGetters['tribe/tribeId']
          })
        )

        if (res.errors) throw res.errors

        dispatch('alerts/showMessage', 'Submitted for review', { root: true })

        // submissionId
        return res.data.proposeEditWhakapapaView
      } catch (err) {
        const message = 'Something went wrong while trying to create a submission to edit a whakapapa view'
        dispatch('alerts/showError', message, { root: true })

        // eslint-disable-next-line no-console
        console.error(message, err)
      }
    },
    async processWhakapapaLinkSubmission ({ dispatch }, input) {
      // check if any of the profiles on the link are ignored
      const groupId = input?.recps[0]
      if (!groupId) return // TODO: add appropriate error handling here

      const views = (await dispatch('whakapapa/getWhakapapaViews', { groupId }, { root: true })) || []

      function viewsIgnoringProfile (profileId) {
        return views?.filter(view => view?.ignoredProfiles?.includes(profileId))
      }

      const { parent, child } = input.allowedFields
      const viewsIgnoringChild = viewsIgnoringProfile(child)
      const viewsIgnoringParent = viewsIgnoringProfile(parent)

      // if no profiles are ignored, then we handle it like usual
      if (!viewsIgnoringChild?.length && !viewsIgnoringParent?.length) {
        return dispatch('approveWhakapapaLinkSubmission', input)
      }

      function unignoreFromViews (profileId, views) {
        return Promise.all(
          views.map(async view => {
            await dispatch('whakapapa/saveWhakapapaView', {
              id: view.id,
              ignoredProfiles: {
                remove: [profileId]
              }
            }, { root: true })

            return view.id
          })
        )
      }

      // otherwise we unignore the profiles in each view that its ignored from
      await unignoreFromViews(child, viewsIgnoringChild)
      await unignoreFromViews(parent, viewsIgnoringParent)

      // TODO: what happens if there is no targetId?
      // approve the submission without executing it
      await dispatch('approveSubmission', input)
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
    async approveEditWhakapapaViewSubmission ({ dispatch }, input) {
      const {
        id: submissionId,
        comment,

        whakapapaId,
        allowedFields
      } = input

      try {
        const whakapapaInput = {
          id: whakapapaId,

          // NOTE: this only supports ignored fields at the moment
          ...allowedFields
        }
        // TODO: Cherese 4/10/23 there is a bug with using this method directly.
        // The bug: not saving the ignored profile changes, i wasnt able to reproduce it in a test
        // rather than spending more time debugging, we will just manually execute the
        // submission (save the whakapapa) and manually approve by passing the updateId (targetId)
        // const res = await apollo.mutate(
        //   approveEditWhakapapaViewSubmission(input)
        // )

        // NOTE: not using the helper in store/whakapapa because it reloads the whakapapa which will fail
        const whakapapaUpdateId = await apollo.niceMutation(dispatch, saveWhakapapaView(whakapapaInput))
        await dispatch('approveSubmission', {
          id: submissionId,
          comment,
          targetId: whakapapaUpdateId
        })

        const view = await dispatch('whakapapa/getWhakapapaView', whakapapaId, { root: true })

        // if updating whakapapa while in whakapapa view
        dispatch('whakapapa/updateViewInViews', view, { root: true })
        await dispatch('whakapapa/loadWhakapapaView', whakapapaId, { root: true })

        // TODO: change this help text when we add support to add/edit whakapapa views
        // for now we only supports ignoring a profile
        dispatch('alerts/showMessage', 'The submission was approved and the profile was hidden', { root: true })

        return submissionId
      } catch (err) {
        dispatch('whakapapa/setForceReload', false, { root: true })

        const message = 'Something went wrong while trying to approve the submission'
        dispatch('alerts/showError', message, { root: true })

        // eslint-disable-next-line no-console
        console.error(message, input.id, err)
      }
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
