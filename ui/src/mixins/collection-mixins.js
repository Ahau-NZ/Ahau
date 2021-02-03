import { saveCollection, getAllCollections, saveCollectionStoryLink } from '@/lib/collection-helpers'

export const collectionsApolloMixin = {
  apollo: {
    collections () {
      const isPersonal = this.$route.params.profileId === this.whoami.personal.profile.id

      if (isPersonal) return getAllCollections({ groupId: this.whoami.personal.groupId })

      return {
        ...getAllCollections({ groupId: this.$route.params.tribeId }),
        skip () {
          // skip getting any collections if we arent on a community archive
          return this.$route.name !== 'community/archive'
        }
      }
    }
  }
}

const methods = {
  async saveCollection (input) {
    try {
      if (!input.id) {
        input.authors = {
          add: ['*']
        }
      }

      const res = await this.$apollo.mutate(
        saveCollection(input)
      )

      if (res.errors) throw res.errors

      return res.data.saveCollection
    } catch (err) {
      console.error('Something went wrong while trying to save a collection', input)
      console.error(err)
    }
  },

  // saves a single link between a collection and a story
  // different from the other link API
  async saveCollectionStoryLink (input) {
    try {
      // enable all authors
      if (!input.linkId) {
        input.authors = {
          add: ['*']
        }
      }

      const res = await this.$apollo.mutate(
        saveCollectionStoryLink(input)
      )

      if (res.errors) throw res.errors

      return res.data.saveCollectionStoryLink
    } catch (err) {
      console.error('Something went wrong while trying to save the link between a collection and story', input)
      console.error(err)
    }
  },
  async removeStoryLink ({ date, linkId }) {
    try {
      await this.saveCollectionStoryLink({ linkId, tombstone: { date } })
    } catch (err) {
      console.error('something went wrong while removing a link', linkId)
      throw err
    }
  },
  async saveCollectionsToStory (story, collections) {
    if (!collections) return
    if (!this.currentAccess) {
      throw new Error('saveCollections requires vuex.currentAccess')
    }

    const { add, remove } = collections

    // existing linked collections are already removed prior
    // we just need to worry about creating or removing links here

    if (add && add.length > 0) {
      await Promise.all(add.map(async collection => {
        // create the link between the collection and story
        const input = {
          collection: collection.id,
          story: story.id,
          recps: [this.currentAccess.groupId]
        }

        // save the link
        await this.saveCollectionStoryLink(input)
      }))
    }

    if (remove && remove.length > 0) {
      await Promise.all(remove.map(async collection => {
        if (collection.linkId) {
          await this.removeStoryLink({
            date: new Date(),
            linkId: collection.linkId
          })
          return collection
        }
      }))
    }
  },
  // TODO (later): refactor this and saveCollections as they are similar
  async saveStoriesToCollection (collectionId, stories) {
    if (!stories) return
    if (!this.currentAccess) {
      throw new Error('saveStoriesToCollection requires vuex.currentAccess')
    }

    const { add, remove } = stories

    // existing linked collections are already removed prior
    // we just need to worry about creating or removing links here

    if (add && add.length > 0) {
      await Promise.all(add.map(async story => {
        // create the link between the collection and story
        const input = {
          collection: collectionId,
          story: story.id,
          recps: [this.currentAccess.groupId]
        }

        // save the link
        await this.saveCollectionStoryLink(input)
      }))
    }

    if (remove && remove.length > 0) {
      await Promise.all(remove.map(async story => {
        if (story.linkId) {
          await this.removeStoryLink({
            date: new Date(),
            linkId: story.linkId
          })
          return story
        }
      }))
    }
  }
}

export const saveCollectionsMixin = {
  methods: {
    ...methods
  }
}
