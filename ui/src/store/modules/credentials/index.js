import { offerMembershipCredential } from '@/lib/tribes-application-helpers.mjs'
import { getAllCredentials, getAllMessages } from './credential-helpers'

const handleErr = (msg) => {
  console.error(msg)
  return false
}

export default function (apollo) {
  const state = {
    credentials: [],
    messages: []
  }

  const getters = {
    credentials: state => {
      return state.credentials
    },
    messages: state => {
      return state.messages
    }
  }

  const mutations = {
    setCredentials (state, credentials) {
      state.credentials = credentials
    },
    setMessages (state, messages) {
      state.messages = messages
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

        if (res.errors) throw res.errors

        dispatch('alerts/showMessage', 'The membership credential was offered!', { root: true })
      } catch (err) {
        console.error(err)
        dispatch('alerts/showError', 'Something went wrong while trying to offer a membership credential!', { root: true })

        throw err
      }
    },
    async getAllCredentials ({ commit, dispatch, state }) {
      // get all credentials
      const credentials = await apollo.query(getAllCredentials)
        .catch(err => {
          if (err)console.error('error getting credentials ' + err)
        })
      commit('setCredentials', credentials.data.verifiableCredentials)
    },
    async getAllMessages ({ commit, dispatch, state }) {
      // get all credential messages
      const messages = await apollo.query(getAllMessages)
        .catch(err => {
          if (err)console.error('error getting messages ' + err)
        })
      commit('setMessages', messages.data.getPlutoMessages)
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
