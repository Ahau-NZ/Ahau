import { saveStory, getStory, getAllStories, getAllStoriesByMentions } from '@/lib/story-helpers.js'
import { saveArtefact } from '@/lib/artefact-helpers.js'
import { saveLink, TYPES } from '@/lib/link-helpers.js'
import { mapActions, mapMutations } from 'vuex'

export const storiesApolloMixin = {
  apollo: {
    stories () {
      if (!this.whoami) throw new Error("the stories apollo query needs whoami. Use vuex.mapGetters(['whoami'])")

      // extract type from the route name
      // TODO: could be better
      const type = this.$route.name.split('/')[0]

      const isPersonal = this.$route.params.profileId === this.whoami.personal.profile.id

      if (isPersonal) {
        return {
          ...getAllStories({ groupId: this.whoami.personal.groupId }),
          error
        }
      } else if (type === 'community') {
        return {
          ...getAllStories({ groupId: this.$route.params.tribeId }),
          error
        }
      } else if (type === 'person') {
        return {
          ...getAllStoriesByMentions(this.$route.params.profileId),
          update (data) {
            return data.person.mentions.map(mention => {
              return {
                linkId: mention.linkId,
                ...mention.story
              }
            })
              .reverse()
          },
          error
        }
      }
    }
  }
}

function error (err) {
  if (!this.showAlert) {
    console.error('error function needs the mutation showAlert')
  }
  const message = 'Something went wrong while trying to get stories'

  console.error(message)
  console.error(err)

  // TODO: figure out how to stop queries when there is an error
  // this.$apollo.queries.stories.stop()
  this.stories = []

  // show message on screen
  this.showAlert({
    message,
    delay: 5000,
    color: 'red'
  })
}

export const methods = {
  // saveStory - handles the saveStory mutation
  async saveStory (input) {
    // enable all authors on all new stories
    if (!input.id) { // no id means a new story is being created
      input.authors = {
        add: ['*'] // * means all authors
      }
    }

    try {
      const res = await this.$apollo.mutate(
        saveStory(input)
      )

      // handle errors
      if (res.errors) throw res.errors

      return res.data.saveStory // the story id
    } catch (err) {
      console.error('Something went wrong while saving a story')
      console.error(err)
    }
  },
  async processStory (input) {
    var {
      artefacts,
      mentions,
      contributors,
      creators,
      relatedRecords,
      collections
    } = input

    try {
      // save the changes to the story
      const id = await this.saveStory(input)

      // get the full story
      var story = await this.getStory(id)

      await Promise.all(
        // save all link updates
        [
          this.saveArtefacts(story, artefacts),
          this.saveMentions(story, mentions),
          this.saveContributors(story, contributors),
          this.saveCreators(story, creators),
          this.saveRelatedRecords(story, relatedRecords),
          this.saveCollectionsToStory(story, collections)
        ]
      )

      // reload again
      story = await this.getStory(id)

      if (input.id) {
        this.setStory(story)
      } else {
        this.toggleStory(story)
      }

      console.log('collections:', collections)
      if (this.$refs.child.$apollo.queries.collection) {
        this.$refs.child.$apollo.queries.collection.refetch()
      }

      this.$apollo.queries.stories.refetch()
    } catch (err) {
      console.error('Something went wrong while creating a story')
      throw err
    }
  },
  async saveRelatedRecords (story, relatedRecords) {
    await this.processLinks(relatedRecords, {
      type: TYPES.STORY_STORY,
      parent: story.id,
      recps: story.recps
    })
  },
  async saveCreators (story, creators) {
    await this.processLinks(creators, {
      type: TYPES.STORY_PROFILE_CREATOR,
      parent: story.id,
      recps: story.recps
    })
  },
  async saveContributors (story, contributors) {
    await this.processLinks(contributors, {
      type: TYPES.STORY_PROFILE_CONTRIBUTOR,
      parent: story.id,
      recps: story.recps
    })
  },
  async saveMentions (story, mentions) {
    await this.processLinks(mentions, {
      type: TYPES.STORY_PROFILE_MENTION,
      parent: story.id,
      recps: story.recps
    })
  },
  async saveArtefacts (story, artefacts) {
    if (artefacts) {
      const {
        add,
        remove
      } = artefacts

      if (add && add.length > 0) {
        await Promise.all(add.map(async artefact => {
          if (!artefact.id) artefact.recps = story.recps
          const artefactId = await this.saveArtefact(artefact)
          if (!artefactId) return

          // if the artefact didnt have an id, then it means we create the link
          if (!artefact.id) {
            var artefactInput = {
              type: TYPES.STORY_ARTEFACT,
              parent: story.id,
              child: artefactId,
              recps: story.recps
            }

            await this.saveLink(artefactInput)
          }
        }))
      }

      if (remove && remove.length > 0) {
        await Promise.all(remove.map(async artefact => {
          if (artefact.linkId) {
            await this.removeLink({
              date: new Date(),
              linkId: artefact.linkId
            })
          }
          return artefact
        }))
      }
    }
  },
  async processLinks (object, { type, parent, recps }) {
    if (!object) return

    const { add, remove } = object

    if (add && add.length > 0) {
      await Promise.all(add.map(async linkedItem => {
        if (linkedItem.id) {
          const linkInput = {
            type,
            parent,
            child: linkedItem.id,
            recps
          }

          await this.saveLink(linkInput)
        }
        return linkedItem
      }))
    }

    if (remove && remove.length > 0) {
      await Promise.all(remove.map(async linkedItem => {
        if (linkedItem.linkId) {
          await this.removeLink({
            date: new Date(),
            linkId: linkedItem.linkId
          })
        }
        return linkedItem
      }))
    }
  },

  async saveArtefact (input) {
    if (!input.id) {
      // if there is not ID, its a create
      // TODO: remove this later if we want to choose authors
      input.authors = {
        add: ['*']
      }
    }

    try {
      const res = await this.$apollo.mutate(
        saveArtefact(input)
      )

      if (res.errors) {
        console.error('Error saving artefact:', input)
        throw res.errors
      }

      return res.data.saveArtefact
    } catch (err) {
      console.error('something went wrong while saving an artefact.', err)
    }
  },

  async getStory (id) {
    try {
      if (!id) throw new Error('getStory(id) missing id')

      const res = await this.$apollo.query(
        getStory(id)
      )

      if (res.errors) {
        console.error('error getting story', id)
        throw res.errors
      }

      return res.data.story
    } catch (err) {
      console.error('Something went wrong while getting a story')
      console.error(err)
    }
  },

  async saveLink (input) {
    try {
      const res = await this.$apollo.mutate(
        saveLink(input)
      )

      if (res.errors) {
        console.error('error saving the link.', input)
        throw res.errors
      }

      // return the linkId
      return res.data.saveLink
    } catch (err) {
      console.error('something went wrong while saving a link')
      throw err
    }
  },

  async removeLink ({ date, linkId }) {
    try {
      await this.saveLink({ linkId, tombstone: { date } })
    } catch (err) {
      console.error('something went wrong while removing a link', linkId)
      throw err
    }
  },
  toggleStory (story) {
    this.setStory(story)
    this.toggleShowStory()
    this.setDialog(null)
  }
}

export const saveStoryMixin = {
  methods: {
    ...mapMutations(['setStory']),
    ...mapActions(['toggleShowStory', 'setDialog']),
    ...methods
  }
}
