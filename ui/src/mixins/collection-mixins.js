import { saveCollection, getAllCollections, saveStoryLink } from '@/lib/collection-helpers'

// TODO make this function reusable for story, profile and collection mixins
export default function mapStoryMixins ({ mapMethods, mapApollo }) {
  var customMixin = {}
  if (mapMethods) {
    customMixin.methods = {}

    mapMethods.forEach(m => {
      if (methods[m]) customMixin.methods[m] = methods[m]
    })
  }

  if (mapApollo) {
    customMixin.apollo = {}

    mapApollo.forEach(m => {
      if (apollo[m]) customMixin.apollo[m] = apollo[m]
    })
  }

  return customMixin
}

const apollo = {
  collections () {
    const isPersonal = this.$route.params.profileId === this.whoami.personal.profile.id

    if (isPersonal) return getAllCollections({ groupId: this.whoami.personal.groupId })
    else return getAllCollections({ groupId: this.$route.params.tribeId })
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
      console.error('Something went wrong while trying to save collection', input)
      console.error(err)
    }
  },
  async saveStoryLink (input) {
    try {
      // enable all authors
      input.authors = {
        add: ['*']
      }

      const res = await this.$apollo.mutate(
        saveStoryLink(input)
      )

      if (res.errors) throw res.errors

      // refresh something here....
      console.warn('needs to reload after saving story link')
    } catch (err) {
      console.error('Something went wrong while trying to save the link between a collection and story', input)
      console.error(err)
    }
  }
}
