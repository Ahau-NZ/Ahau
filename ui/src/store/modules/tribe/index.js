import { initGroup, getTribe, getTribes } from './apollo-helpers'

export default function (apollo) {
  const state = {
    tribes: []
  }

  const getters = {
    tribes: state => {
      return state.tribes
    }
  }

  const mutations = {
    updateTribes (state, tribes) {
      state.tribes = tribes
    }
  }

  const actions = {
    async getTribe ({ rootState }, id) {
      try {
        if (id === rootState.whoami.personal.groupId) {
          return {
            groupId: rootState.whoami.personal.groupId,
            ...rootState.whoami.personal.profile
          }
        }

        const res = await apollo.query({
          ...getTribe,
          variables: {
            id
          }
        })

        if (res.errors) throw res.errors

        return res.data.tribe
      } catch (err) {
        console.error('Something went wrong while fetching tribe: ', id)
        console.error(err)
      }
    },
    async getTribes ({ commit }) {
      try {
        const res = await apollo.query(getTribes)

        if (res.errors) throw res.errors

        commit('updateTribes', res.data.tribes)

        return res.data.tribes
      } catch (err) {
        console.error('Failed to get tribes', err)
        return []
      }
    },
    async initGroup ({ dispatch }, input) {
      try {
        const res = await apollo.mutate(
          initGroup(input)
        )

        if (res.errors) throw res.errors

        return dispatch('getTribe', res.data.initGroup.groupId) // groupId
      } catch (err) {
        console.error('failed to initialise the group, its profiles and kaitiaki-only subgroup', err)
      }
    },
    // NOTE: this is an alias for saveGroupProfileLink with a clearer name
    async createPrivateGroupProfileLink ({ dispatch }, input) {
      try {
        return dispatch('saveGroupProfileLink', input)
      } catch (err) {
        console.error('failed to create private link between group and profile')
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
