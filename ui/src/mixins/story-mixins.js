import { saveStory, getStory, getAllStories, getAllStoriesByMentions } from '@/lib/story-helpers.js'
import { saveArtefact } from '@/lib/artefact-helpers.js'
import { saveLink, TYPES } from '@/lib/link-helpers.js'

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
  stories () {
    const isPersonal = this.currentProfile.id === this.whoami.personal.profile.id

    if (isPersonal) return getAllStories({ groupId: this.whoami.personal.groupId })
    else if (this.currentProfile.type === 'community') return getAllStories({ groupId: this.currentTribe.id })
    else if (this.currentProfile.type === 'person') {
      return {
        ...getAllStoriesByMentions(this.currentProfile.id),
        update (data) {
          return data.person.mentions.map(mention => {
            return {
              linkId: mention.linkId,
              ...mention.story
            }
          })
            .reverse()
        }
      }
    }
  }
}

const methods = {
  async saveStory (input) {
    var {
      id,
      artefacts,
      mentions,
      contributors,
      creators,
      relatedRecords
    } = input

    try {
      const res = await this.$apollo.mutate(saveStory(input))

      if (res.errors) throw res.errors
      if (!id) id = res.data.saveStory

      // get the full story
      var story = await this.getStory(id)

      // process the artefacts
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
                parent: id,
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

      if (mentions) {
        await this.processLinks(mentions, { type: TYPES.STORY_PROFILE_MENTION, parent: id, recps: story.recps })
      }

      if (contributors) {
        await this.processLinks(contributors, { type: TYPES.STORY_PROFILE_CONTRIBUTOR, parent: id, recps: story.recps })
      }

      if (creators) {
        await this.processLinks(creators, { type: TYPES.STORY_PROFILE_CREATOR, parent: id, recps: story.recps })
      }

      if (relatedRecords) {
        await this.processLinks(relatedRecords, { type: TYPES.STORY_STORY, recps: story.recps })
      }

      // reload again
      story = await this.getStory(id)

      if (input.id) {
        this.setStory(story)
      } else {
        this.toggleStory(story)
      }

      // load the story with this ones id
      this.$apollo.queries.stories.refetch({ id })
    } catch (err) {
      console.error('Something went wrong while creating a story')
      throw err
    }
  },
  async processLinks (object, { type, parent, recps }) {
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
    try {
      const res = await this.$apollo.mutate(saveArtefact(input))

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

      const res = await this.$apollo.query(getStory(id))

      if (res.errors) {
        console.error('error getting story', id)
        throw res.errors
      }

      return res.data.story
    } catch (err) {
      console.error(err)
      console.error('something went wrong while getting a story')
      throw err
    }
  },

  async saveLink (input) {
    try {
      const res = await this.$apollo.mutate(saveLink(input))

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
  }
}