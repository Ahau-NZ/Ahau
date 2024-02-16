import { offerMembershipCredential } from '@/lib/tribes-application-helpers.mjs'
import { getAllCredentials } from './credential-helpers'

const handleErr = (msg) => {
  console.error(msg)
  return false
}

export default function (apollo) {
  const state = {
    credentials: []
  }

  const getters = {
    credentials: state => {
      return state.credentials
    }
  }

  const mutations = {
    setCredentials (state, credentials) {
      state.credentials = credentials
    }
  }

  const actions = {
    async isValidIssuer (context, tribeId) {
      const config = await window.ahoy?.getConfig()

      const atalaPrismConfig = config?.atalaPrism

      if (!atalaPrismConfig) return handleErr('Missing atalaPrism ssb config')
      if (!atalaPrismConfig?.mediatorDID) return handleErr('Missing atalaPrism.mediatorDID ssb config')
      if (!atalaPrismConfig.issuers[tribeId]) return handleErr('Missing atalaPrism.issuers ssb config for the tribe with id: ' + tribeId)

      return true
    },
    async offerCredential ({ dispatch }, input) {
      try {
        const res = await apollo.mutate(
          offerMembershipCredential(input)
        )

        if (res.errors) throw res

        dispatch('alerts/showMessage', 'The membership credential was offered!', { root: true })
      } catch (err) {
        console.error(err)
        dispatch('alerts/showError', 'Something went wrong while trying to offer a membership credential!', { root: true })

        return null
      }
    },
    async getAllCredentials ({ commit, dispatch, state }) {
      // get all credentials
      const credentials = await apollo.query(getAllCredentials)
        .catch(err => {
          if (err)console.error('error getting credentials ' + err)
        })
      commit('setCredentials', credentials.data.verifiableCredentials)
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
