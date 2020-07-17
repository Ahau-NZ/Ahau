<template>
  <div>
    <v-container fluid class="body-width white pa-5 niho-bg">

      <div :class="{'showOverlay': showStory && !mobile}">
        <v-row v-if="!showStory" class="top-margin mb-5">
          <v-col class="headliner black--text pa-0 pl-4 pt-2">
            Timeline
          </v-col>
          <div>
            <v-btn :medium="!mobile" text :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab
              color="white" @click.prevent="dialog = 'new-story'" elevation="1">
              <v-icon :large="!mobile" class="black--text">mdi-plus</v-icon>
            </v-btn>
          </div>
        </v-row>

        <v-row v-if="profileStories && profileStories.length > 0">
          <transition name="change" mode="out-in">
            <v-col cols="12" xs="12" sm="12" md="9" :class="!showStory ? '':'pa-0'">
              <div v-if="!showStory">
                <TimelineCard :data="profileStories" @toggleStory="toggleStory($event)" />
              </div>
              <div v-else>
                <v-row :class="mobile ? 'pa-0': 'px-6 top-margin'">
                  <StoryCard @updateDialog="updateDialog($event)" :fullStory="true" :story.sync="currentStory"
                    @submit="saveStory($event)" @close="toggleStory($event)" />
                </v-row>
              </div>
            </v-col>
          </transition>
        </v-row>
        <v-row v-else>
          <v-col>
            <div v-if="!profileStories || (profileStories && profileStories.length < 1)"
              class="px-8 subtitle-1 grey--text " :class="{
                      'text-center': mobile
                    }">
              No timeline events found
            </div>
          </v-col>
        </v-row>

      </div>
    </v-container>
  </div>
</template>

<script>
  import TimelineCard from '@/components/story/TimelineCard'
  import StoryCard from '@/components/archive/StoryCard.vue'

  import {
    mapGetters,
    mapActions,
    mapMutations
  } from 'vuex'

  import {
    SAVE_STORY,
    GET_STORY
  } from '@/lib/story-helpers.js'
  import {
    SAVE_ARTEFACT
  } from '@/lib/artefact-helpers.js'
  import {
    SAVE_LINK,
    TYPES
  } from '@/lib/link-helpers.js'

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
    data() {
      return {}
    },
    computed: {
      ...mapGetters(['stories', 'currentProfile', 'showStory', 'currentStory']),
      mobile() {
        return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
      },
      profileStories() {
        console.log("this.currentProfile.type",this.currentProfile.type)
        
        if (this.currentProfile.type === 'person') {
          let profileStories = this.stories.filter((story) =>
            story.mentions.some((mention) =>
              mention.profile.id === this.currentProfile.id
            ))
            console.log("profileStories",profileStories)
          return profileStories
        } else {
          // TODO - update to only return stories access === community
          console.log("this.stories",this.stories)
          return this.stories
        }
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
      ...mapActions(['setShowStory', 'setDialog']),
      updateDialog(dialog) {
        this.$emit('setDialog', dialog)
      },
      toggleStory(story) {
        this.setStory(story)
        this.setShowStory()
        this.setDialog(null)
      },
      // Save Story if edited
      async saveStory(input) {
        var {
          id,
          artefacts,
          mentions,
          contributors,
          creators,
          relatedRecords
        } = input

        try {
          const res = await this.$apollo.mutate(SAVE_STORY(input))
          if (res.errors) throw res.errors

          if (!id) {
            id = res.data.saveStory
          }

          // process the artefacts
          if (artefacts) {
            const {
              add,
              remove
            } = artefacts

            if (add && add.length > 0) {
              // all artefacts to create or update
              await Promise.all(add.map(async artefact => {
                const artefactId = await this.saveArtefact(artefact)
                if (!artefactId) return

                // if the artefact didnt have an id, then it means we create the link
                if (!artefact.id) {
                  const artefactInput = {
                    type: TYPES.STORY_ARTEFACT,
                    parent: id,
                    child: artefactId
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
            await this.processLinks(id, mentions, TYPES.STORY_PROFILE_MENTION)
          }

          if (contributors) {
            await this.processLinks(id, contributors, TYPES.STORY_PROFILE_CONTRIBUTOR)
          }

          if (creators) {
            await this.processLinks(id, creators, TYPES.STORY_PROFILE_CREATOR)
          }

          if (relatedRecords) {
            await this.processLinks(id, relatedRecords, TYPES.STORY_STORY)
          }

          var story = await this.getStory(id)

          if (input.id) {
            this.currentStory = story
          } else {
            this.toggleStory(story)
          }

          console.warn('Potentially loading a large amount of data with each change to a story...')
          this.getAllStories()
        } catch (err) {
          throw err
        }
      },
      async processLinks(parentId, object, type) {
        const {
          add,
          remove
        } = object

        if (add && add.length > 0) {
          await Promise.all(add.map(async linkedItem => {
            if (linkedItem.id) {
              const linkInput = {
                type,
                parent: parentId,
                child: linkedItem.id
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
      async saveArtefact(input) {
        try {
          const res = await this.$apollo.mutate(SAVE_ARTEFACT(input))
          if (res.errors) {
            throw res.errors
          }

          return res.data.saveArtefact
        } catch (err) {
          throw new Error('failed to save artefact. ' + err)
        }
      },
      async getStory(id) {
        const res = await this.$apollo.query(GET_STORY(id))

        if (res.errors) {
          console.error('failed to get the story. ' + res.errors)
          return
        }

        return res.data.story
      },
      async saveLink({
        type,
        parent,
        child
      }) {
        const res = await this.$apollo.mutate(SAVE_LINK({
          type,
          parent,
          child,
          recps: [this.whoami.feedId]
        }))

        if (res.errors) {
          console.error('error creating the link. ' + res.errors)
          return
        }

        // return the linkId
        return res.data.saveLink
      },
      async removeLink({
        date,
        linkId
      }) {
        const res = await this.$apollo.mutate(SAVE_LINK({
          linkId,
          tombstone: {
            date
          }
        }))

        if (res.errors) {
          console.error('error removing link. ' + res.errors)
          return
        }

        return res.data.saveLink
      },
    }
  }
</script>
<style lang="scss">

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