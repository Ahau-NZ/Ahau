import { deleteStory } from './apollo-helpers'

export default function (apollo) {
  const state = {
  }

  const getters = {
  }

  const mutations = {
  }

  const actions = {
    async deleteStory ({ dispatch }, storyId) {
      try {
        const res = await apollo.mutate(
          deleteStory(storyId, new Date())
        )

        if (res.errors) throw new Error(res.errors)

        dispatch('alerts/showMessage', 'The Story was deleted!', { root: true })
      } catch (err) {
        console.error(err)
        dispatch('alerts/showError', 'Something went wrong while deleting the Story!', { root: true })
      }
    }
  }

  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
  }
}
