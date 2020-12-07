<template>
  <div>
    <div class="px-2">
      <!-- VIEW STORY OVERLAY -->
      <div :class="{ 'showOverlay': showStory && !mobile }"></div>
      <v-row v-if="!showStory" class="top-margin mb-10">
        <v-col cols="10" class="headliner black--text pa-0 pl-4 pt-2">
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
          <v-col>
            <!-- TODO: Search records -->
            <!-- <v-btn :class="mobile ? 'searchBtnMob' : 'searchBtn'" :small="!mobile" :x-small="mobile" class="my-2" fab flat color="white" @click="editProfile()">
            <v-icon small class="black--text">mdi-magnify</v-icon>
          </v-btn>            -->
          <!-- <v-btn :medium="!mobile" :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab color="white" @click.stop="openContextMenu($event)"> -->
          <BigAddButton @click="dialog = 'new-story'" />
        </v-col>
      </v-row>
      <div>
        <v-row v-if="stories && stories.length > 0">
            <v-col cols="12" xs="12" sm="12" md="9" :class="!showStory ? '':'pa-0'">
              <!-- <v-row>
                <CollectionGroup :collections="collections" />
              </v-row>
              <v-divider class="mt-6 mb-8" light></v-divider> -->
              <div v-if="!showStory">
                <v-row v-for="(story, i) in stories" :key="`story-${i}-id-${story.id}`">
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
                    @close="toggleStory($event)"
                  />
                </v-row>
              </div>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col>
              <div v-if="!stories || (stories && stories.length < 1)">
                <div v-if="!stories">
                  <v-card
                    :width="mobile ? '100%' : '87%'"
                    flat
                    :ripple="false"
                    light
                    v-for="n in 4"
                    :key="`skeleton-${n}`"
                  >
                    <v-skeleton-loader
                      :width="mobile ? '100%' : '87%'"
                      type="card, card-avatar"
                    ></v-skeleton-loader>
                  </v-card>
                </div>
                <div v-else
                  class="px-8 subtitle-1 grey--text "
                  :class="{ 'text-center': mobile }"
                >
                  No records found
                </div>
              </div>
          </v-col>
        </v-row>
      </div>
      <ArchiveHelper v-if="showArchiveHelper" :show="showArchiveHelper" @close="toggleArchiveHelper" />
    </div>
    <NewRecordDialog v-if="dialog === 'new-story'" :show="dialog === 'new-story'"
      :title="`Add record to ${ profile.preferredName || 'Untitled' }'s archive`" @close="dialog = null"
      @submit="saveStory($event)"
    />
  </div>
</template>

<script>
import StoryCard from '@/components/archive/StoryCard.vue'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'

// TODO: Replace with Archive Helper (doesnt exist yet)
import ArchiveHelper from '@/components/dialog/archive/ArchiveHelper.vue'
import mapStoryMixins from '@/mixins/story-mixins.js'

export default {
  name: 'Archive',
  props: {
    profile: Object
  },
  mixins: [
    mapStoryMixins({
      mapMethods: ['saveStory', 'processLinks', 'saveArtefact', 'getStory', 'saveLink', 'removeLink'],
      mapApollo: ['stories']
    })
  ],
  components: {
    StoryCard,
    NewRecordDialog,
    ArchiveHelper,
    BigAddButton
  },
  data () {
    return {
      // profile: {},
      stories: null,
      dialog: null,
      scrollPosition: 0,
      showArchiveHelper: false
    }
  },
  computed: {
    ...mapGetters(['profileStories', 'showStory', 'whoami', 'currentTribe', 'currentStory', 'showArtefact', 'storeDialog']),
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
    ...mapMutations(['setStory']),
    ...mapActions(['setComponent', 'toggleShowStory', 'setDialog']),
    toggleArchiveHelper () {
      this.showArchiveHelper = !this.showArchiveHelper
    },
    toggleStory (story) {
      this.setStory(story)
      this.toggleShowStory()
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

  .infoButton {
    margin-left: 10px;
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

  .fade-in-enter-active {
    transition: all .5s ease;
  }

  .fade-in-leave-active {
    transition: all .5s ease;
  }

  .fade-in-enter, .fade-in-leave-to {
    opacity: 0;
  }
</style>
