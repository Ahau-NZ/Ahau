import { createSubGroup, getSubGroups } from './apollo-helpers'

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
    async createSubGroup (context, groupId) {
      try {
        const res = await apollo.mutate(
          createSubGroup(groupId)
        )

        if (res.errors) throw res.errors

        return res.data.createSubGroup
      } catch (err) {
        console.error('failed to create a subgroup', err)
      }
    },
    async getSubGroups (context, groupId) {
      try {
        const res = await apollo.query(
          getSubGroups(groupId)
        )

        if (res.errors) throw res.errors

        return res.data.subtribes
      } catch (err) {
        console.error('failed to get subgroups for a group', err)
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
