<template>
  <div>
    <div class="px-2">
      <div v-if="showStory" :class="{ 'showOverlay': showStory && !mobile }"></div>
      <v-row class="top-margin mb-10">
        <v-col cols="10" class="headliner black--text pa-0 pl-4 pt-2 pb-5">
          Archive
          <v-icon color="blue-grey" light @click="toggleArchiveHelper" class="infoButton">mdi-information</v-icon>
        </v-col>
        <v-col v-show="!showStory">
          <BigAddButton @click.native.stop="openContextMenu($event)" />
        </v-col>
        <v-col v-show="!showStory">
          <CollectionGroup :collections="collections" @selectedIndex="index = $event" />
        </v-col>
        <v-col>
          <Stories :stories="stories" @save="saveStory($event)" title="Stories"/>
        </v-col>
      </v-row>
      <ArchiveHelper v-if="showArchiveHelper" :show="showArchiveHelper" @close="toggleArchiveHelper" />
    </div>
    <VueContext ref="menu" class="pa-4">
    <li v-for="(option, index) in contextMenuOpts" :key="index">
      <a href="#" @click.prevent="dialog = option.dialog" class="d-flex align-center px-4">
        <v-icon light>{{ option.icon }}</v-icon>
        <p class="ma-0 pl-3">{{ option.title }}</p>
      </a>
    </li>
  </VueContext>

    <NewRecordDialog v-if="dialog === 'new-story'" :show="dialog === 'new-story'"
      :title="`Add record to ${ profile.preferredName || 'Untitled' }'s archive`" @close="dialog = null"
      @submit="saveStory($event)"
    />
    <NewCollectionDialog v-if="dialog === 'new-collection'" :show="dialog === 'new-collection'"
      :title="`Add collection to ${ profile.preferredName || 'Untitled' }'s archive`" @close="dialog = null"
      @submit="saveCollection($event)"
    />
  </div>
</template>

<script>
import Stories from '@/components/archive/Stories.vue'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'
import NewCollectionDialog from '@/components/dialog/archive/NewCollectionDialog.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'

// TODO: Replace with Archive Helper (doesnt exist yet)
import ArchiveHelper from '@/components/dialog/archive/ArchiveHelper.vue'

import mapStoryMixins from '@/mixins/story-mixins.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'
import mapCollectionMixins from '@/mixins/collection-mixins.js'

import CollectionGroup from '@/components/archive/CollectionGroup.vue'

import { VueContext } from 'vue-context'

export default {
  name: 'Archive',
  props: {
    profile: Object
  },
  mixins: [
    mapStoryMixins({
      mapMethods: ['saveStory', 'processLinks', 'saveArtefact', 'getStory', 'saveLink', 'removeLink'],
      mapApollo: ['stories']
    }),
    mapCollectionMixins({
      mapMethods: ['saveCollection'],
      mapApollo: ['collections']
    }),
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  components: {
    Stories,
    NewRecordDialog,
    NewCollectionDialog,
    ArchiveHelper,
    BigAddButton,
    CollectionGroup,
    VueContext
  },
  data () {
    return {
      stories: null,
      dialog: null,
      scrollPosition: 0,
      showArchiveHelper: false,
      showNewCollection: false,
      collections: [],
      selectedCollection: null,
      index: null,
      contextMenuOpts: [{
        title: 'Create a new Collection',
        dialog: 'new-collection',
        icon: 'mdi-folder-multiple-outline'
      },
      {
        title: 'Add new record',
        dialog: 'new-story',
        icon: 'mdi-file-outline'
      }]
    }
  },
  computed: {
    ...mapGetters(['showStory', 'whoami', 'currentStory', 'showArtefact', 'storeDialog']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  methods: {
    ...mapMutations(['setStory']),
    ...mapActions(['toggleShowStory', 'setDialog']),
    toggleArchiveHelper () {
      this.showArchiveHelper = !this.showArchiveHelper
    },
    openContextMenu ($event) {
      this.$refs.menu.open($event)
    },
    toggleStory (story) {
      this.setStory(story)
      this.toggleShowStory()
      this.setDialog(null)
    }
  },
  watch: {
    index (i) {
      this.selectedCollection = this.collections[i]
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

  .sub-headliner {
    font-size: 0.8em;
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
