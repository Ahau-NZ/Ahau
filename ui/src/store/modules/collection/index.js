import { saveCollection, saveCollectionStoryLink, deleteCollection, getAllCollections } from './apollo-helpers'
import { getCollection } from '@/lib/story-helpers' // TODO move to collecion-helpers, see comments in this file

export default function (apollo) {
  const state = {
  }

  const getters = {
  }

  const mutations = {
  }

  const actions = {
    async saveCollection (context, input) {
      try {
        const res = await apollo.mutate(
          saveCollection(input)
        )

        if (res.errors) throw new Error(res.errors)

        // TODO success alert message
        return res.data.saveCollection
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    async saveCollectionStoryLink (context, input) {
      try {
        const res = await apollo.mutate(
          saveCollectionStoryLink(input)
        )

        if (res.errors) throw res.errors

        // TODO sucess alert message
        return res.data.saveCollectionStoryLink
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    async removeStoryFromCollection ({ dispatch }, { date, linkId }) {
      try {
        await dispatch('saveCollectionStoryLink', { linkId, tombstone: { date } })
        // TODO success alert message?
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    // TEMP: this should sit in store/modules/story.js when that is added
    async saveCollectionsToStory ({ rootGetters, dispatch }, { storyId, collections }) {
      if (!collections) return

      const { add, remove } = collections

      // existing linked collections are already removed prior
      // we just need to worry about creating or removing links here

      if (add && add.length > 0) {
        await Promise.all(add.map(async collection => {
          // create the link between the collection and story
          // save the link
          await dispatch({
            collection: collection.id,
            story: storyId,
            recps: [rootGetters.currentAccess.groupId]
          })
        }))
      }

      if (remove && remove.length > 0) {
        await Promise.all(remove.map(async collection => {
          if (collection.linkId) {
            await dispatch('removeStoryFromCollection', {
              date: new Date(),
              linkId: collection.linkId
            })
          }
        }))
      }
    },
    async saveStoriesToCollection ({ rootGetters, dispatch }, { collectionId, stories }) {
      if (!stories) return

      const { add, remove } = stories

      // existing linked collections are already removed prior
      // we just need to worry about creating or removing links here

      if (add && add.length > 0) {
        await Promise.all(add.map(async story => {
          // create the link between the collection and story
          // save the link
          await dispatch('saveCollectionStoryLink', {
            collection: collectionId,
            story: story.id,
            recps: [rootGetters.currentAccess.groupId]
          })
        }))
      }

      if (remove && remove.length > 0) {
        await Promise.all(remove.map(async story => {
          if (story.linkId) {
            await dispatch('removeStoryFromCollection', {
              date: new Date(),
              linkId: story.linkId
            })
          }
        }))
      }
    },
    async createCollection ({ dispatch }, input) {
      try {
        const { stories } = input

        if (input.id) throw new Error('collection/createCollection is for creating. An id was found on the input')

        const collectionId = await dispatch('saveCollection', input)
        await dispatch('saveStoriesToCollection', { collectionId, stories })

        return dispatch('getCollection', collectionId)
      } catch (err) {
        // TODO error handling
        console.error(err)
      }
    },
    async getCollection (context, id) {
      try {
        const res = await apollo.query(
          getCollection(id)
        )

        if (res.errors) throw new Error(res.errors)

        // TODO success alert message
        return res.data.collection
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    async getCollectionsByGroup (context, groupId) {
      try {
        const res = await apollo.query(
          getAllCollections(groupId)
        )

        if (res.errors) throw new Error(res.errors)

        // TODO success alert message
        return res.data.collections
      } catch (err) {
        // TODO error handling
        console.error(err)
        return []
      }
    },
    async updateCollection ({ dispatch }, input) {
      try {
        const { id: collectionId, stories } = input

        if (!collectionId) throw new Error('collection/updateCollection is for updating. Missing collectionId on the input')

        await dispatch('saveCollection', input)
        await dispatch('saveStoriesToCollection', { collectionId, stories })

        return dispatch('getCollection', collectionId)
      } catch (err) {
        // TODO error handling
        console.error(err)
      }
    },
    async deleteCollection (context, collectionId) {
      try {
        const res = await apollo.mutate(
          deleteCollection(collectionId, new Date())
        )

        if (res.errors) throw new Error(res.errors)

        return
      } catch (err) {
        // TODO error handling
        console.error(err)
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
