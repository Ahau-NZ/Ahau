<template>
  <div>
    <div class="px-2">
      <div v-if="showStory" :class="{ 'showOverlay': showStory && !mobile }"></div>
      <v-row v-show="!showStory" class="top-margin">
        <v-col cols="10" class="headliner black--text pa-0 pl-4 pt-2 pb-5">
          {{ onCollectionPage ? 'Collection' : currentAccess.preferredName ? `${currentAccess.preferredName}'s Archive` : `${currentAccess.legalName}'s Archive`}}
          <v-icon color="blue-grey" light @click="toggleArchiveHelper" class="infoButton">mdi-information</v-icon>
        </v-col>
        <v-col v-show="!showStory">
          <BigAddButton @click.native.stop="openContextMenu($event)" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <router-view :profile="profile" :stories="stories" :collections="collections"
            @processStory="processStory"
            :hide-collections="!allowCollections"
          ></router-view>
        </v-col>
      </v-row>
      <ArchiveHelper v-if="showArchiveHelper" :show="showArchiveHelper" @close="toggleArchiveHelper" />
    </div>

    <VueContext ref="menu" class="pa-4">
    <li v-if="allowCollections">
      <a href="#" @click.prevent="dialog = 'new-collection'" class="d-flex align-center px-4">
        <v-icon light>mdi-folder-multiple-outline</v-icon>
        <p class="ma-0 pl-3">Create a new collection</p>
      </a>
    </li>
    <li>
      <a href="#" @click.prevent="dialog = 'new-story'" class="d-flex align-center px-4">
        <v-icon light>mdi-file-outline</v-icon>
        <p class="ma-0 pl-3">Add a new story</p>
      </a>
    </li>
  </VueContext>

    <NewRecordDialog v-if="dialog === 'new-story'" :show="dialog === 'new-story'"
      :title="`Add record to ${ profile.preferredName || 'Untitled' }'s archive`" @close="dialog = null"
      @submit="processStory"
    />
    <NewCollectionDialog v-if="dialog === 'new-collection'" :show="dialog === 'new-collection'"
      :title="`Add a collection to ${ collectionTitle } archive`" @close="dialog = null"
      @submit="processCollection"
    />
  </div>
</template>

<script>
import { mapGetters, createNamespacedHelpers } from 'vuex'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'
import NewCollectionDialog from '@/components/dialog/archive/NewCollectionDialog.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'

// TODO: Replace with Archive Helper (doesnt exist yet)
import ArchiveHelper from '@/components/dialog/archive/ArchiveHelper.vue'

import { saveStoryMixin, storiesApolloMixin } from '@/mixins/story-mixins.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'
import { collectionsApolloMixin, saveCollectionsMixin } from '@/mixins/collection-mixins.js'

import { getCollection } from '@/lib/story-helpers'

import { VueContext } from 'vue-context'

const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')

export default {
  name: 'Archive',
  props: {
    profile: Object
  },
  mixins: [
    saveStoryMixin,
    storiesApolloMixin,
    collectionsApolloMixin,
    saveCollectionsMixin,
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  components: {
    NewRecordDialog,
    NewCollectionDialog,
    ArchiveHelper,
    BigAddButton,
    VueContext
  },
  data () {
    return {
      stories: null,
      collections: [],
      dialog: null,
      scrollPosition: 0,
      showArchiveHelper: false
    }
  },
  computed: {
    ...mapGetters(['showStory', 'whoami', 'currentStory', 'showArtefact', 'storeDialog', 'currentAccess']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    collectionTitle () {
      if (!this.profile || !this.profile.preferredName) return 'this'
      return this.profile.preferredName + "'s"
    },
    archiveTitle () {
      // if my community profile return profile name
      // if my profile return profile.name
      // if person profile but not my profile return tribe name 
      if (!this.profile || !this.profile.preferredName) return 'this'
      return this.profile.preferredName + "'s"
    },
    
    allowCollections () {
      // only personal or community archives will see collections

      // if on personal archive
      const isPersonal = this.$route.params.profileId === this.whoami.personal.profile.id
      if (isPersonal) return true

      // if on a community archive we're on
      if (this.$route.name === 'community/archive') return true

      // route name is person/archive
      return false
    },
    onCollectionPage () {
      console.log('this.$route.name', this.$route.name)
      if (this.$route.name === 'person/archive/:collectionId' || this.$route.name === 'community/archive/:collectionId') {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    ...mapAlertMutations(['showAlert']),
    toggleArchiveHelper () {
      this.showArchiveHelper = !this.showArchiveHelper
    },
    openContextMenu ($event) {
      this.$refs.menu.open($event)
    },
    async processCollection ($event) {
      const { stories } = $event

      try {
        // save the collection
        const id = await this.saveCollection($event)

        // get it from the db
        const res = await this.$apollo.query(
          getCollection(id)
        )

        if (res.errors) throw res.errors

        // save the collection-story links
        await this.saveStoriesToCollection(id, stories)

        // reload the collections and stories to reflect new links
        this.$apollo.queries.collections.refetch({ filter: { groupId: this.$route.params.tribeId } })
        this.$apollo.queries.stories.refetch({ filter: { groupId: this.$route.params.tribeId } })
      } catch (err) {
        console.error('Something went wrong while saving a new collections and/or linking stories to it', $event)
        console.error(err)
      }
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
