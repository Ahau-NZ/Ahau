import { saveCommunity, savePublicCommunity, updateTribe } from '@/lib/community-helpers.js' // TODO cherese 23-08-21 move these to ./apollo-helpers

export default function (apollo) {
  const state = {
  }

  const getters = {
  }

  const mutations = {
  }

  const actions = {
    async saveCommunity (context, input) {
      try {
        const res = await apollo.mutate(
          saveCommunity(input)
        )

        if (res.errors) throw res.errors

        return res.data.saveCommunity // profileId
      } catch (err) {
        console.error('failed to save a private community profile', err)
      }
    },
    async savePublicCommunity (context, input) {
      try {
        const res = await apollo.mutate(
          savePublicCommunity(input)
        )

        if (res.errors) throw res.errors

        return res.data.saveCommunity // profileId
      } catch (err) {
        console.error('failed to save a public community profile', err)
      }
    },
    async updateCommunity ({ dispatch }, { tribe, input }) {
      try {
        const res = await apollo.mutate(
          updateTribe(tribe, input)
        )

        if (res.errors) throw res.errors
      } catch (err) {
        console.error('Error updating a community', err)
        dispatch('alerts/showError', 'Something went wrong while trying to update the community', { root: true })
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
