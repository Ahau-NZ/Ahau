<template>
  <div>
    <v-container fluid class="body-width px-2">

      <div :class="{'showOverlay': showStory && !mobile}"></div>

      <v-row v-if="!showStory" class="top-margin mb-5">
        <v-col class="headliner black--text pa-0 pl-4 pt-2">
          Timeline
        </v-col>
        <!-- <div>
          <v-btn :medium="!mobile" text :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab
            color="white" @click.prevent="dialog = 'new-story'" elevation="1">
            <v-icon :large="!mobile" class="black--text">mdi-plus</v-icon>
          </v-btn>
        </div> -->
      </v-row>

      <v-row v-if="profileStories && profileStories.length > 0" >
          <v-col cols="12" xs="12" sm="12" :md="showStory ? '9':'12'" :class="!showStory ? '':'pa-0'">
            <div v-if="!showStory">
              <TimelineCard :data="profileStories" @toggleStory="toggleStory($event)" />
            </div>
            <!-- Full story view -->
            <div v-else>
              <v-row :class="mobile ? 'pa-0': 'px-6 top-margin'">
                <StoryCard
                  @updateDialog="updateDialog($event)"
                  :fullStory="true"
                  :story.sync="currentStory"
                  @submit="saveStory($event)"
                  @close="toggleStory($event)"
                />
              </v-row>
            </div>
          </v-col>
      </v-row>
      <v-row v-else>
        <v-col>
          <div v-if="!profileStories || (profileStories && profileStories.length < 1)"
            class="px-8 subtitle-1 grey--text " :class="{
                      'text-center': mobile
                    }">
            No records found in this profile. Please add record to this profile via Archive
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import TimelineCard from '@/components/story/TimelineCard'
import StoryCard from '@/components/archive/StoryCard.vue'

import { mapGetters, mapActions, mapMutations } from 'vuex'
import { saveStory, getStory } from '@/lib/story-helpers.js'
import { saveArtefact } from '@/lib/artefact-helpers.js'
import { saveLink, TYPES } from '@/lib/link-helpers.js'

export default {
  name: 'Timeline',
  components: {
    TimelineCard,
    StoryCard
  },
  props: {
    profile: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['stories', 'currentProfile', 'showStory', 'currentStory', 'whoami', 'profileStories']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  watch: {
    // showStory(newVal, oldVal) {
    //   if (oldVal === false && newVal === true) {
    //     this.scrollPosition = window.pageYOffset
    //     window.scrollTo(0, 0)
    //   } else if (oldVal === true && newVal === false) {
    //     setTimeout(() => {
    //       window.scrollTo({
    //         top: this.scrollPosition
    //       })
    //     }, 100)
    //   }
    // }
  },
  methods: {
    ...mapMutations(['setStory']),
    ...mapActions(['setShowStory', 'setDialog', 'getAllStories']),
    updateDialog (dialog) {
      this.$emit('setDialog', dialog)
    },

    toggleStory (story) {
      this.setStory(story)
      this.setShowStory()
      this.setDialog(null)
    },
    // Save Story if edited
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

        console.warn('Potentially loading a large amount of data with each change to a story...')
        this.getAllStories()
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
}
</script>
<style lang="scss">

  .top-margin {
    margin-top: 80px
  }

  .headliner {
    font-size: 1em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
  }

  .addBtn {
    position: fixed;
    top: 80px;
    right: 100px
  }

  .addBtnMob {
    position: absolute;
    top: 80px;
    right: 20px
  }

  .showOverlay {
    z-index: 1;
    height: 100%;
    width: 100%;
    position: fixed;
    overflow: auto;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 0, 0.81);
  }

</style>
