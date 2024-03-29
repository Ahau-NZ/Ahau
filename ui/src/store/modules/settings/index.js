import {
  getSettings,
  getAllSettings,
  saveSettings,
  deleteSettings,
  getBackup,
  deleteAhau,
  updateAutoPrune,
  disableAutoPrune,
  getAutoPruneConfig

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
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    async getBackup () {
      try {
        const res = await apollo.query(
          getBackup
        )

        if (res.errors) throw new Error(res.errors)

        return res.data.backup
      } catch (err) {
        console.error(err)
        return null
      }
    },
    // TODO: not sure the best place to put this function!
    async deleteAhau () {
      try {
        const res = await apollo.mutate(deleteAhau)

        if (res.errors) throw new Error(res.errors)

        return true
      } catch (err) {
        console.error(err)
      }
    },
    async updateKeyBackupSettings ({ dispatch, rootGetters }, backedUp) {
      const id = rootGetters.whoami.personal.settings.id
      const input = {
        id,
        keyBackedUp: backedUp
      }

      await dispatch('updateSettings', input)
      await dispatch('setWhoami', null, { root: true })
    },
    async updateAutoPrune (context, input) {
      try {
        const res = await apollo.mutate(
          updateAutoPrune(input)
        )

        if (res.errors) throw new Error(res.errors)

        return res.data.saveHyperBlobsAutoPruneConfig // returns boolean
      } catch (err) {
        console.error('Something went wrong while trying to save new hyperBlobs auto-prune config', err)
        return false
      }
    },
    async disableAutoPrune () {
      try {
        const res = await apollo.mutate(
          disableAutoPrune
        )

        if (res.errors) throw new Error(res.errors)

        return res.data.saveHyperBlobsAutoPruneConfig
      } catch (err) {
        console.error('Something went wrong while trying to disable auto-prune', err)
        return null
      }
    },
    async getAutoPruneConfig () {
      try {
        const res = await apollo.query(
          getAutoPruneConfig
        )

        if (res.errors) throw new Error(res.errors)

        return res.data.hyperBlobsAutoPruneConfig
      } catch (err) {
        console.error('Something went wrong while trying to get hyperBlobs auto-prune config', err)
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
