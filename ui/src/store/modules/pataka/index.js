import {
  blockPataka,
  unblockPataka
} from './apollo-helpers'

export default function (apollo) {
  const state = {
  }

  const getters = {
  }

  const mutations = {
  }

  const actions = {
    blockPataka ({ dispatch }, feedId) {
      return apollo.mutate(blockPataka(feedId))
        .then(() => {
          const msg = 'Pataka blocked!'
          dispatch('alerts/showMessage', msg, { root: true })
        })
        .catch((err) => {
          const msg = 'Something went wrong, unable to block pataka'
          dispatch('alerts/showError', msg, { root: true })
          console.error(err)
        })
    },
    unblockPataka ({ dispatch }, feedId) {
      return apollo.mutate(unblockPataka(feedId))
        .then(() => {
          const msg = 'Pataka unblocked!'
          dispatch('alerts/showMessage', msg, { root: true })
        })
        .catch((err) => {
          const msg = 'Something went wrong, unable to unblock pataka'
          dispatch('alerts/showError', msg, { root: true })
          console.error(err)
        })
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
