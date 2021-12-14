import { getProfile } from './apollo-helpers'

export default function (apollo) {
  const state = {
  }

  const getters = {
  }

  const mutations = {
  }

  const actions = {
    // this handles getting both types of profile (person + community)
    async getProfile (_, id) {
      try {
        // TODO cherese 14/12/2021 this is an old pattern, needs to change when the getProfile mutation
        // isnt being used in profile-mixins.
        const res = await apollo.query({
          ...getProfile,
          variables: { id }
        })

        if (res.errors) throw res.errors

        return res.data.profile
      } catch (err) {
        console.error('Something went wrong while trying to get a profile', id)
        console.error(err)
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
