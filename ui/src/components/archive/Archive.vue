<template>
<div>
  <v-container fluid class="body-width px-2">
    <!-- VIEW STORY OVERLAY -->
    <div :class="{ 'showOverlay': showStory && !mobile }"></div>
    <v-row v-if="!showStory" class="top-margin mb-5">
      <v-col class="headliner black--text pa-0 pl-4">
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
        <v-btn :medium="!mobile" flat text :x-small="mobile" :class="mobile ? 'addBtnMob' : 'addBtn'" class="my-2" fab color="white" @click.prevent="setDialog('new-story')">
          <v-icon :large="!mobile" class="black--text">mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-row>
    <v-row>
      <transition name="change" mode="out-in">
        <v-col cols="12" xs="12" sm="12" md="9" :class="!showStory ? '':'pa-0'">
          <!-- <v-row>
            <CollectionGroup :collections="collections" />
          </v-row>
          <v-divider class="mt-6 mb-8" light></v-divider> -->
          <div v-if="!showStory">
            <v-row v-for="(story, i) in stories" :key="`story-${i}-id-${story.id}`" class="mb-10">
              <StoryCard @updateDialog="updateDialog($event)" @toggleStory="toggleStory()" :story="story" />
            </v-row>
          </div>
          <div v-else>
            <v-row :class="mobile ? 'pa-0': 'px-6 top-margin'">
              <StoryCard @updateDialog="updateDialog($event)" :fullStory="true" @toggleStory="toggleStory()" :story="currentStory" @close="toggleStory()"  />
            </v-row>
          </div>
        </v-col>
      </transition>
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

  <!-- <DialogHandler
    :dialog.sync="dialog.active"
    :type.sync="dialog.type"
  /> -->
  </div>
</template>

<script>
// import {
//   VueContext
// } from 'vue-context'

import StoryCard from '@/components/archive/StoryCard.vue'
// import CollectionGroup from '@/components/archive/CollectionGroup.vue'

import { STORIES } from '@/mocks/stories'
import { firstMocks } from '@/mocks/collections'
import { mapGetters, mapActions } from 'vuex'

// const get = require('lodash.get')

export default {
  name: 'Archive',
  components: {
    StoryCard
    // CollectionGroup,
    // VueContext,
    // DialogHandler
  },
  data () {
    return {
      stories: STORIES,
      collections: firstMocks,
      dialog: {
        active: null,
        type: null
      },
      contextMenuOpts: [{
        title: 'Create a new Collection',
        dialog: 'new-collection',
        icon: 'mdi-folder-multiple-outline'
      },
      {
        title: 'Add new record',
        dialog: 'new-story',
        icon: 'mdi-file-outline'
      }
      ],
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
    ...mapGetters(['currentStory', 'showStory']),
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
    showStory (newVal) {
      if (newVal === false) {
        setTimeout(() => {
          window.scrollTo({
            top: this.scrollPosition
          })
        }, 100)
      }
    }
  },
  methods: {
    ...mapActions(['setComponent', 'setShowStory', 'setDialog']),
    toggleStory () {
      this.scrollPosition = window.pageYOffset
      this.setShowStory()
      window.scrollTo(0, 0)
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
  margin-top : 80px
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
  width:'100vw';
  height:200px;
  overflow-y:scroll;
}

.searchBtn {
  position: fixed;
  top:90px;
  right:160px
}

.searchBtnMob {
  position: absolute;
  top: 80px;
  right:80px;
}

.addBtn {
  position: fixed;
  top: 80px;
  right:100px
}

.addBtnMob {
  position: absolute;
  top: 80px;
  right:20px
}

.change-enter-active,
.change-leave-active {
  transition-duration: 0.2;
  transition-property: top;
  transition-timing-function: ease-in-out;
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
