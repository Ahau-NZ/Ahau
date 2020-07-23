<template>
  <div>
    <v-container fluid class="body-width px-2">

      <!-- VIEW STORY OVERLAY -->
      <div :class="{ 'showOverlay': showStory && !mobile }"></div>

      <v-row v-if="!showStory" class="top-margin mb-5">
        <v-col class="headliner black--text pa-0 pl-4 pt-2">
          Archive records
        </v-col>
        <!-- <v-col align="right" class="pa-0">
        <v-btn outlined flat :medium="!mobile" :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab color="white" @click.stop="openContextMenu($event)">
          <v-icon :large="!mobile" class="black--text">mdi-plus</v-icon>
        </v-btn>
      </v-col> -->
        <!-- </v-row> -->
        <!-- TODO: Add Collections -->
        <!-- <v-col cols="12" md="10" sm="10" :class="!mobile ? 'pl-12 my-6' : 'py-0 ma-0'" align="start">
        <h1 class="title black--text ">Collections</h1>
      </v-col> -->
        <div>
          <!-- TODO: Search records -->
          <!-- <v-btn :class="mobile ? 'searchBtnMob' : 'searchBtn'" :small="!mobile" :x-small="mobile" class="my-2" fab flat color="white" @click="editProfile()">
          <v-icon small class="black--text">mdi-magnify</v-icon>
        </v-btn>            -->
          <!-- <v-btn :medium="!mobile" :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab color="white" @click.stop="openContextMenu($event)"> -->
          <v-btn :medium="!mobile" text :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab
            color="white" @click.prevent="dialog = 'new-story'" elevation="1">
            <v-icon :large="!mobile" class="black--text">mdi-plus</v-icon>
          </v-btn>
        </div>
      </v-row>

      <v-row v-if="profileStories && profileStories.length > 0">

        <v-col cols="12" xs="12" sm="12" md="9" :class="!showStory ? '':'pa-0'">
          <!-- <v-row>
            <CollectionGroup :collections="collections" />
          </v-row>
          <v-divider class="mt-6 mb-8" light></v-divider> -->
          <div v-if="!showStory">
           <transition-group name="fade">
              <v-row  v-for="(story, i) in profileStories" :key="`story-${i}-id-${story.id}`" class="mb-5">
                <StoryCard @updateDialog="updateDialog($event)" :key="i" @toggleStory="toggleStory($event)" :story="story" />
              </v-row>
            </transition-group>

          </div>
          <div v-else>
            <v-row :class="mobile ? 'pa-0': 'px-6 top-margin'">
              <StoryCard @updateDialog="updateDialog($event)" :fullStory="true" :story.sync="currentStory"
                @submit="saveStory($event)" @close="toggleStory($event)" />
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
            No records found
          </div>
        </v-col>
      </v-row>
    </v-container>
    <!-- <vue-context ref="menu" class="pa-4">
    <li v-for="(option, index) in contextMenuOpts" :key="index">
      <a href="#" @click.prevent="setDialog(option.dialog)" class="d-flex align-center px-4">
        <v-icon light>{{ option.icon }}</v-icon>
        <p class="ma-0 pl-3">{{ option.title }}</p>
      </a>
    </li>
  </vue-context> -->

    <NewRecordDialog v-if="dialog === 'new-story'" :show="dialog === 'new-story'"
      :title="`Add record to ${currentProfile.preferredName || 'Untitled'}'s archive`" @close="dialog = null"
      @submit="saveStory($event)" />
  </div>
</template>

<script>
import StoryCard from '@/components/archive/StoryCard.vue'
// import CollectionGroup from '@/components/archive/CollectionGroup.vue'
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
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'

export default {
  name: 'Archive',
  components: {
    StoryCard,
    NewRecordDialog
    // CollectionGroup,
    // VueContext,
  },
  data () {
    return {
      dialog: null,
      // contextMenuOpts: [{
      //   title: 'Create a new Collection',
      //   dialog: 'new-collection',
      //   icon: 'mdi-folder-multiple-outline'
      // },
      // {
      //   title: 'Add new record',
      //   dialog: 'new-story',
      //   icon: 'mdi-file-outline'
      // }
      // ],
      scrollPosition: 0
    }
  },
  props: {
    profile: {
      type: Object,
      default: () => ({})
    },
    editProfile: {
      type: Function
    }
  },
  computed: {
    ...mapGetters(['stories', 'showStory', 'whoami', 'currentProfile', 'currentStory', 'profileStories']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    topMargin () {
      if (this.mobile && !this.showStory) return 'top-margin'
      else if (!this.mobile) return 'mt-10'
      return ''
    },
  },
  watch: {
    showStory (newVal, oldVal) {
      if (oldVal === false && newVal === true) {
        this.scrollPosition = window.pageYOffset
        window.scrollTo(0, 0)
      } else if (oldVal === true && newVal === false) {
        setTimeout(() => {
          window.scrollTo({
            top: this.scrollPosition
          })
        }, 100)
      }
    }
  },
  methods: {
    ...mapMutations(['setStory', 'addStoryToStories', 'updateStoryInStories', 'removeStoryFromStories']),
    ...mapActions(['setComponent', 'setShowStory', 'setDialog', 'getAllStories']),
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
          this.setStory(story)
        } else {
          this.toggleStory(story)
        }

        console.warn('Potentially loading a large amount of data with each change to a story...')
        this.getAllStories()
      } catch (err) {
        throw err
      }
    },
    async processLinks (parentId, object, type) {
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
    async saveArtefact (input) {
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
    async getStory (id) {
      const res = await this.$apollo.query(GET_STORY(id))

      if (res.errors) {
        console.error('failed to get the story. ' + res.errors)
        return
      }

      return res.data.story
    },
    async saveLink ({
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
    async removeLink ({
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
    toggleStory (story) {
      this.setStory(story)
      this.setShowStory()
      this.setDialog(null)
    },
    openContextMenu (event) {
      this.$refs.menu.open(event)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~vue-context/dist/css/vue-context.css";

  .top-margin {
    margin-top: 80px
  }

  .overflow {
    width: 100vw;
    overflow-y: scroll;
    -ms-overflow-style: none;
  }

  /* this hides overflow scrollbar */
  .overflow::-webkit-scrollbar {
    display: none;
  }

  .overflow-x {
    width: '100vw';
    height: 200px;
    overflow-y: scroll;
  }

  .searchBtn {
    position: fixed;
    top: 90px;
    right: 160px
  }

  .searchBtnMob {
    position: absolute;
    top: 80px;
    right: 80px;
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

  .niho-bg {
    background: linear-gradient(rgba(255, 255, 255, 0.99),
        rgba(255, 255, 255, 0.7)), url(../../assets/niho.svg);
    background-position-x: 0px;
    background-attachment: fixed;
    // background-repeat: no-repeat;
  }

  .headliner {
    font-size: 1em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
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
