<template>
  <div>
    <div class="px-2">
      <div :class="{ 'showOverlay': showStory && !mobile }"></div>
      <v-row v-if="!showStory" class="top-margin mb-10">
        <v-col cols="10" class="headliner black--text pa-0 pl-4 pt-2">
          Archive records
          <v-icon color="blue-grey" light @click="toggleArchiveHelper" class="infoButton">mdi-information</v-icon>
        </v-col>
        <v-col>
          <BigAddButton @click="dialog = 'new-story'" />
        </v-col>
      </v-row>
      <Stories :stories="stories" @save="saveStory($event)"/>
      <ArchiveHelper v-if="showArchiveHelper" :show="showArchiveHelper" @close="toggleArchiveHelper" />
    </div>
    <NewRecordDialog v-if="dialog === 'new-story'" :show="dialog === 'new-story'"
      :title="`Add record to ${ profile.preferredName || 'Untitled' }'s archive`" @close="dialog = null"
      @submit="saveStory($event)"
    />
  </div>
</template>

<script>
import Stories from '@/components/archive/Stories.vue'
import { mapGetters, mapMutations } from 'vuex'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'

// TODO: Replace with Archive Helper (doesnt exist yet)
import ArchiveHelper from '@/components/dialog/archive/ArchiveHelper.vue'
import mapStoryMixins from '@/mixins/story-mixins.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

// import CollectionGroup from '@/components/archive/CollectionGroup.vue'

export default {
  name: 'Archive',
  mixins: [
    mapStoryMixins({
      mapMethods: ['saveStory', 'processLinks', 'saveArtefact', 'getStory', 'saveLink', 'removeLink'],
      mapApollo: ['stories']
    }),
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  components: {
    Stories,
    NewRecordDialog,
    ArchiveHelper,
    BigAddButton
    // CollectionGroup
  },
  data () {
    return {
      profile: {},
      stories: null,
      dialog: null,
      scrollPosition: 0,
      showArchiveHelper: false,
      collections: []
    }
  },
  computed: {
    ...mapGetters(['showStory', 'whoami', 'currentTribe']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapMutations(['setStory']),
    toggleArchiveHelper () {
      this.showArchiveHelper = !this.showArchiveHelper
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
