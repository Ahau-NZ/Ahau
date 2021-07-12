<template>
  <div>
    <div>
      <div v-if="showStory" :class="{ 'showOverlay': showStory && !mobile }"></div>
      <v-row v-show="!showStory" class="top-margin">
        <v-col v-if="!hideArchiveTitle" cols="7" class="headliner black--text pa-0 py-2 pl-3">
          {{ archiveTitle }}
          <v-icon color="blue-grey" light @click="toggleArchiveHelper" :class="mobile ? 'mobInfoBtn':'infoButton'">mdi-information</v-icon>
        </v-col>
        <v-col v-show="!showStory">
          <BigAddButton :label="$t('viewArchive.newStoryButton')" :customClass="mobile ? 'addBtnMobile':'addBtnDesktop'" @click.native.stop="mobile && profile.canEdit ? openContextMenu($event): dialog = 'new-story' " />
          <!-- Only Kaitiaki can create collections -->
          <BigAddButton v-if="!mobile && profile.canEdit" :label="$t('viewArchive.newCollectionButton')" :customClass="mobile ? 'addBtnMobile':'addBtnCollection'" @click.native.stop="dialog = 'new-collection'" />
        </v-col>
      </v-row>
      <v-row :class="mobile ? '':'mt-4'">
        <v-col v-if="allowCollections" v-show="!showStory" cols="12" class="pl-2 pb-0">
          <CollectionGroup
            :collections="collections"
            @click="showCurrentCollection"
          />
        </v-col>
        <v-col cols="12" class="pt-0" :class="mobile ? '':'mt-4'">
          <Stories :stories="stories" @save="processStory" :title="title" :reload="reload"/>
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
          <v-icon light>mdi-post-outline</v-icon>
          <p class="ma-0 pl-3">Add a new story</p>
        </a>
      </li>
    </VueContext>

    <NewRecordDialog v-if="dialog === 'new-story'" :show="dialog === 'new-story'"
      :title="$t('viewArchive.addStory')" @close="dialog = null"
      @submit="processStory"
    />
    <NewCollectionDialog v-if="dialog === 'new-collection'" :show="dialog === 'new-collection'"
      :title="$t('addCollectionForm.addCollection')" @close="dialog = null"
      @submit="processCollection"
    />
  </div>
</template>

<script>
import { mapGetters, createNamespacedHelpers, mapMutations, mapActions } from 'vuex'
import NewRecordDialog from '@/components/dialog/archive/NewRecordDialog.vue'
import NewCollectionDialog from '@/components/dialog/archive/NewCollectionDialog.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'
import CollectionGroup from '@/components/archive/CollectionGroup.vue'
import Stories from '@/components/archive/Stories.vue'

import { getDisplayName } from '@/lib/person-helpers.js'

// TODO: Replace with Archive Helper (doesnt exist yet)
import ArchiveHelper from '@/components/dialog/archive/ArchiveHelper.vue'

import { saveStoryMixin, storiesApolloMixin } from '@/mixins/story-mixins.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

import { VueContext } from 'vue-context'

const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')
const { mapActions: mapCollectionActions } = createNamespacedHelpers('collection')

export default {
  name: 'Archive',
  props: {
    profile: Object
  },
  mixins: [
    saveStoryMixin,
    storiesApolloMixin,
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  components: {
    NewRecordDialog,
    NewCollectionDialog,
    ArchiveHelper,
    BigAddButton,
    VueContext,
    CollectionGroup,
    Stories
  },
  data () {
    return {
      stories: null,
      collections: null,
      dialog: null,
      scrollPosition: 0,
      showArchiveHelper: false
    }
  },
  beforeMount () {
    window.scrollTo(0, 0)
  },
  async mounted () {
    await this.loadCollections()
  },
  computed: {
    ...mapGetters(['showStory', 'whoami', 'currentStory', 'showArtefact', 'storeDialog', 'currentAccess']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    title () {
      if (this.profile.id !== this.currentAccess.id) return `Stories about ${this.getDisplayName(this.profile)}`
      // TODO i18n on this line ^
      return this.$t('viewArchive.stories')
    },
    hideArchiveTitle () {
      return this.onCollectionPage && this.mobile
    },
    collectionTitle () {
      if (!this.profile || !this.profile.preferredName) return 'this'
      return this.profile.preferredName
    },
    archiveTitle () {
      if (this.isPersonalArchive) return this.$t('viewArchive.archiveTitle')
      return this.currentAccess.preferredName ? `${this.currentAccess.preferredName}'s Archive` : `${this.currentAccess.legalName}'s Archive`
    },
    isPersonalArchive () {
      return this.$route.params.profileId === this.whoami.personal.profile.id
    },
    allowCollections () {
      return this.isPersonalArchive || this.$route.name === 'community/archive'
    },
    onCollectionPage () {
      return this.$route.name === 'person/archive/:collectionId' || this.$route.name === 'community/archive/:collectionId'
    },
    isNewStoryDialogOpen () {
      return this.dialog === 'new-story'
    },
    isNewCollectionDialogOpen () {
      return this.dialog === 'new-collection'
    }
  },
  methods: {
    ...mapAlertMutations(['showAlert']),
    ...mapMutations(['setStory', 'setDialog']),
    ...mapActions(['toggleShowStory', 'setShowArtefact']),
    ...mapCollectionActions(['createCollection', 'getCollectionsByGroup']),
    getDisplayName,
    showCurrentCollection ({ id }) {
      var type = this.$route.name.split('/archive')[0]
      this.$router.push({
        name: type + '/collection',
        params: {
          collectionId: id
        }
      })
    },
    toggleArchiveHelper () {
      this.showArchiveHelper = !this.showArchiveHelper
    },
    openContextMenu ($event) {
      this.$refs.menu.open($event)
    },
    async processCollection (input) {
      const collection = await this.createCollection(input)
      if (collection) this.collections.push(collection)
    },
    async loadCollections () {
      const groupId = this.$route.params.profileId === this.whoami.personal.profile.id
        ? this.whoami.personal.groupId
        : this.$route.params.tribeId

      this.collections = await this.getCollectionsByGroup(groupId)
    },
    async reload () {
      await this.loadCollections()
      this.$apollo.queries.stories.refetch({ filter: { groupId: this.$route.params.tribeId, type: '*' } })
    },
    cordovaBackButton () {
      if (this.showArtefact) {
        this.setShowArtefact()
        return false
      }
      if (this.showStory) {
        this.toggleShowStory()
        return false
      }
      if (this.isNewStoryDialogOpen || this.isNewCollectionDialogOpen) {
        this.dialog = null
        return false
      } else this.$router.go(-1)
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
        }, 200)
      }
    },
    t (key, vars) {
      return this.$t('viewArchive.' + key, vars)
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

  .mobInfoBtn {
    position: absolute;
    right: 15px;
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
