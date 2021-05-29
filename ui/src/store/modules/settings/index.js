import {
  getSettings,
  getAllSettings,
  saveSettings,
  deleteSettings,
  getLatestSeq
} from './apollo-helpers'

export default function (apollo) {
  const state = {

  }

  const getters = {

  }

  const mutations = {

  }

  const actions = {
    async saveSettings (context, input) {
      try {
        const res = await apollo.mutate(
          saveSettings(input)
        )

        if (res.errors) throw new Error(res.errors)

        return res.data.saveSettings
      } catch (err) {
        console.error(err)
      }
    },
    async createSettings ({ dispatch, rootGetters }, input) {
      try {
        if (input.id) throw new Error('settings/createSettings is for creating.  An id was found on the input')

        if (!input.authors) {
          input.authors = {
            add: [rootGetters.whoami.public.feedId] // We only want to edit this ourselves
          }
        }

        const id = await dispatch('saveSettings', input)

        return dispatch('getSettings', id)
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    async getSettings (context, id) {
      try {
        const res = await apollo.query(
          getSettings(id)
        )

        if (res.errors) throw new Error(res.errors)

        return res.data.settings
      } catch (err) {
        console.error(err)
      }
    },
    async getAllSettings (context) {
      try {
        const res = await apollo.query(
          getAllSettings
        )

        if (res.errors) throw new Error(res.errors)

        return res.data.allSettings
      } catch (err) {
        console.error(err)
      }
    },
    async updateSettings ({ dispatch }, input) {
      try {
        if (!input.id) throw new Error('settings/updateSettings is for updating.  No id was found on the input')

        const id = await dispatch('saveSettings', input)

        return dispatch('getSettings', id)
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    async deleteSettings (context, id) {
      try {
        const res = await apollo.mutate(
          deleteSettings(id, new Date())
        )

        if (res.errors) throw new Error(res.errors)

        return
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    async getLatestSeq () {
      try {
        const res = await apollo.query(
          getLatestSeq
        )

        if (res.errors) throw res.errors

        return res.data.latestSequence
      } catch (err) {
        console.error(err)
        return null
      }
    }
  }

  return {
    state,
    getters,
    mutations,
    actions,
    namespaced: true
  }
}
