import { offerMembershipCredential } from '@/lib/tribes-application-helpers.mjs'

export default function (apollo) {
  const state = {}
  const getters = {}
  const mutations = {}

  const actions = {
    async isValidConfig (context, tribeId) {
      // check the tribe has issuesVerifiedCredentials enabled
      const config = await window.ahoy?.getConfig()

      return Boolean(config?.atalaPrism?.issuers[tribeId])
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
