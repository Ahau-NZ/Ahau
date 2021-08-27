import { getTribes } from '@/lib/community-helpers'
import { createGroup, getTribeIds, saveGroupProfileLink } from './apollo-helpers'

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
    async getTribeIds () {
      try {
        const res = await apollo.query(getTribeIds)

        if (res.errors) throw res.errors

        return res.data.listGroups.map(d => d.id)
      } catch (err) {
        console.error('failed to get group ids', err)
        return []
      }
    },
    async createGroup () {
      try {
        const res = await apollo.mutate(createGroup)

        if (res.errors) throw res.errors

        return res.data.createGroup.id
      } catch (err) {
        console.error('failed to create a group', err)
      }
    },
    // async createSubgroup (context, groupId) {
    //   try {
    //     const res = await apollo.mutate(
    //       createSubgroup(groupId)
    //     )

    //     if (res.errors) throw res.errors

    //     return res.data.createSubgroup.id
    //   } catch (err) {
    //     console.error('failed to create a subgroup', err)
    //   }
    // },
    async saveGroupProfileLink (context, { group, profile, allowPublic }) {
      try {
        const res = await apollo.mutate(
          saveGroupProfileLink({
            profile,
            group,
            allowPublic
          })
        )

        if (res.errors) throw res.errors

        return res.data.saveGroupProfileLink
      } catch (err) {
        console.error('failed to create link between group and profile', err)
      }
    },
    async createPublicGroupProfileLink ({ dispatch }, { group, profile }) {
      try {
        return dispatch('saveGroupProfileLink', {
          group,
          profile,
          allowPublic: true
        })
      } catch (err) {
        console.log('failed to create public link between group and profile', err)
      }
    },
    // NOTE: this is an alias for saveGroupProfileLink with a clearer name
    async createPrivateGroupProfileLink ({ dispatch }, { group, profile }) {
      try {
        return dispatch('saveGroupProfileLink', {
          group,
          profile
        })
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
