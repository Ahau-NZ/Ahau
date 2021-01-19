import { saveCollection, getAllCollections, saveStoryLink } from '@/lib/collection-helpers'

export const collectionsApolloMixin = {
  apollo: {
    collections () {
      const isPersonal = this.$route.params.profileId === this.whoami.personal.profile.id

      if (isPersonal) return getAllCollections({ groupId: this.whoami.personal.groupId })
      else return getAllCollections({ groupId: this.$route.params.tribeId })
    }
  }
}

const methods = {
  async saveCollection (input) {
    try {
      input.authors = {
        add: ['*']
      }

      const res = await this.$apollo.mutate(
        saveCollection(input)
      )

      if (res.errors) throw res.errors

      const id = res.data.saveCollection

      this.$apollo.queries.collections.refetch({ id })
    } catch (err) {
      console.error('Something went wrong while trying to save a collection', input)
      console.error(err)
    }
  },

  // saves a single link between a collection and a story
  // different from the other link API
  async saveStoryLink (input) {
    try {
      // enable all authors
      if (!input.linkId) {
        input.authors = {
          add: ['*']
        }
      }

      const res = await this.$apollo.mutate(
        saveStoryLink(input)
      )

      if (res.errors) throw res.errors

      // refresh something here....
      console.warn('needs to reload after saving story link')
      console.warn('return something here... linkId?')
      return res.data.saveStoryLink
    } catch (err) {
      console.error('Something went wrong while trying to save the link between a collection and story', input)
      console.error(err)
    }
  },
  async removeStoryLink ({ date, linkId }) {
    try {
      await this.saveStoryLink({ linkId, tombstone: { date } })
    } catch (err) {
      console.error('something went wrong while removing a link', linkId)
      throw err
    }
  },
  async saveCollections (story, collections) {
    if (!collections) return

    const { add, remove } = collections

    // existing linked collections are already removed prior
    // we just need to worry about creating or removing links here

    if (add && add.length > 0) {
      await Promise.all(add.map(async collection => {
        // create the link between the collection and story
        const input = {
          collection: collection.id,
          story: story.id,
          recps: story.recps // TODO: what recps to use here....
        }

        // save the link
        await this.saveStoryLink(input)
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
  }
}

export const saveCollectionsMixin = {
  methods: {
    ...methods
  }
}
