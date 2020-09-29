<template>
<div>
  <v-container fluid class="body-width px-2">
    <!-- VIEW STORY OVERLAY -->
    <div :class="{ 'showOverlay': showStory && !mobile }"></div>
    <v-row v-if="!showStory" class="top-margin mb-5">
      <v-col cols="12" class="headliner black--text pa-0 pl-4 pt-2">
        Archive records
        <v-icon color="blue-grey" light @click="toggleArchiveHelper" class="infoButton">mdi-information</v-icon>
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
        <v-btn
          @click.prevent="dialog = 'new-story'"
          :class="!mobile ? 'addBtn my-2' : 'addBtnMobile'"
          :color="!mobile ? 'white' : 'rgba(160, 35, 36,1)'"
          elevation="4"
          fab
          light

          :fixed="mobile"
          :bottom="mobile"
          :right="mobile"
        >
          <v-icon :large="!mobile" :class="!mobile ? 'black--text' : 'white--text'">mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-row>
    <v-row v-if="profileStories && profileStories.length > 0">
      <transition name="change" mode="out-in">
        <v-col cols="12" xs="12" sm="12" md="9" :class="!showStory ? '':'pa-0'">
          <!-- <v-row>
            <CollectionGroup :collections="collections" />
          </v-row>
          <v-divider class="mt-6 mb-8" light></v-divider> -->
          <div v-if="!showStory">
            <v-row v-for="(story, i) in profileStories" :key="`story-${i}-id-${story.id}`">
              <StoryCard @updateDialog="updateDialog($event)" @toggleStory="toggleStory($event)" :story="story" />
            </v-row>
          </div>
          <div v-else>
            <v-row :class="mobile ? 'pa-0': 'px-6 top-margin'">
              <StoryCard
                :fullStory="true"
                :story.sync="currentStory"
                @updateDialog="updateDialog($event)"
                @submit="saveStory($event)"
                @close="toggleStory($event)" />
            </v-row>
          </div>
        </v-col>
      </transition>
      </v-row>
      <v-row v-else>
        <v-col>
          <div v-if="!profileStories || (profileStories && profileStories.length < 1)"
            class="px-8 subtitle-1 grey--text " :class="{ 'text-center': mobile }"
          >
          No records found
        </div>
      </v-col>
    </v-row>
    <ArchiveHelper v-if="showArchiveHelper" :show="showArchiveHelper" @close="toggleArchiveHelper" />
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
import { saveStory, getStory } from '@/lib/story-helpers.js'
import { saveArtefact } from '@/lib/artefact-helpers.js'
import { saveLink, TYPES } from '@/lib/link-helpers.js'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'

// TODO: Replace with Archive Helper (doesnt exist yet)
import ArchiveHelper from '@/components/dialog/archive/ArchiveHelper.vue'

export default {
  name: 'Archive',
  components: {
    StoryCard,
    NewRecordDialog,
    ArchiveHelper
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
      scrollPosition: 0,
      showArchiveHelper: false
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
  beforeMount() {
    this.getAllStories()
  },
  computed: {
    ...mapGetters(['profileStories', 'showStory', 'whoami', 'currentProfile', 'currentTribe', 'currentStory', 'showArtefact', 'storeDialog']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    topMargin () {
      if (this.mobile && !this.showStory) return 'top-margin'
      else if (!this.mobile) return 'mt-10'
      return ''
    }
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
    toggleArchiveHelper () {
      this.showArchiveHelper = !this.showArchiveHelper
    },
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

.addBtnMobile {
    bottom: 16px !important;
  }

  .infoButton {
    margin-left: 10px;
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
