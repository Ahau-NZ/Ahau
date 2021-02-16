<template>
  <div>
    <v-container fluid v-if="collection" >
      <!-- Collection Header -->
      <v-row v-if="!showStory">
        <!-- <CollectionTitle v-if="mobile" :collection="collection" @click="dialog = 'edit-collection'"/> -->
        <v-col v-if="mobile" cols="12" class="headliner black--text pa-0 pb-2 mt-n10">
          {{ collection.name + ' collection'}}
            <v-icon color="blue-grey" light @click="viewCollection" class="text-right justify-end">mdi-information</v-icon>
        </v-col>
        <v-col v-else cols="12" xs="12" sm="12" md="9" class="pa-0">
          <v-row class="pb-5">
            <CollectionTitleCard :collection="collection" :access="[access]" @click="editCollection"/>
          </v-row>
        </v-col>
      </v-row>

      <!-- STORIES -->
      <v-row>
        <v-col cols="12" class="px-0">
          <Stories
            title="Stories"
            :stories="stories"
            @save="$emit('processStory', $event)"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Dialog -->
    <NewCollectionDialog
      v-if="collection && dialog"
      :show="dialog"
      :collection="collection"
      :title="editing ? `Edit ${collection.name || 'Untitled'} Collection` : `${collection.name} Collection`"
      :editing="editing"
      :view="view"
      @submit="processCollection"
      @delete="dialog = 'delete-collection'"
      @close="close"
      @edit="editCollection"
    />
    <DeleteCollectionDialog
      v-if="dialog === 'delete-collection'"
      :show="dialog === 'delete-collection'"
      @submit="deleteCollection"
      @close="close"
    />
  </div>
</template>

<script>
import { deleteCollection } from '@/lib/collection-helpers'
import { getCollection } from '@/lib/story-helpers'
import { getTribalProfile } from '@/lib/community-helpers'

import mapProfileMixins from '@/mixins/profile-mixins.js'
import { saveCollectionsMixin } from '@/mixins/collection-mixins.js'

import { mapGetters, mapMutations } from 'vuex'
import Stories from '../components/archive/Stories.vue'

import NewCollectionDialog from '@/components/dialog/archive/NewCollectionDialog.vue'
import DeleteCollectionDialog from '@/components/dialog/archive/DeleteCollectionDialog.vue'
import CollectionTitleCard from '@/components/archive/CollectionTitleCard.vue'

export default {
  name: 'CollectionShow',
  mixins: [
    saveCollectionsMixin,
    mapProfileMixins({
      mapMethods: ['getTribe']
    })
  ],
  apollo: {
    collection () {
      return {
        ...getCollection(this.$route.params.collectionId)
      }
    }
  },
  components: {
    Stories,
    NewCollectionDialog,
    DeleteCollectionDialog,
    CollectionTitleCard
  },
  data () {
    return {
      collection: null,
      access: null,
      dialog: false,
      editing: false,
      view: false
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess', 'showStory']),
    stories () {
      if (!this.collection || !this.collection.stories) return []

      return this.collection.stories.map(link => {
        return {
          linkId: link.linkId,
          ...link.story
        }
      })
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
  },
  watch: {
    async collection (collection) {
      if (collection.recps && collection.recps.length > 0) {
        const tribe = await this.getTribe(collection.recps[0])
        this.access = getTribalProfile(tribe, this.whoami)
        this.setCurrentAccess(this.access)
      }
    }
  },
  methods: {
    ...mapMutations(['setCurrentAccess']),
    editCollection () {
      this.view = false
      this.editing = true
      this.dialog = true
    },
    viewCollection () {
      this.view = true
      this.editing = false
      this.dialog = true
    },
    close () {
      this.view = false
      this.editing = false
      this.dialog = false
    },
    async processCollection ($event) {
      const { stories } = $event

      await this.saveCollection($event)
      await this.saveStoriesToCollection(this.collection.id, stories)

      this.$parent.$apollo.queries.collections.refetch({
        filter: { groupId: this.$route.params.tribeId }
      })
      this.$parent.$apollo.queries.stories.refetch({
        filter: { groupId: this.$route.params.tribeId }
      })

      this.$apollo.queries.collection.refetch()
    },
    async deleteCollection () {
      const res = await this.$apollo.mutate(
        deleteCollection(this.collection.id, new Date())
      )

      if (res.errors) {
        console.error('failed to delete collection', res.errors)
        return
      }

      // reload parent component collections
      await this.$parent.$apollo.queries.collections.refetch({
        filter: { groupId: this.$route.params.tribeId }
      })

      // go to the default archive page
      const [newPath] = this.$route.fullPath.split('archive/')
      this.$router.push({ path: newPath + 'archive' }).catch(() => {})
    }
  }
}
</script>
<style lang="scss">
@media (min-width: 1264px) and (max-width: 1903px) {
  .col-lg-20p {
    width: 20%;
    max-width: 20%;
    flex-basis: 20%;
  }
  .col-lg-60p {
    width: 60%;
    max-width: 60%;
    flex-basis: 60%;
  }
  .col-lg-80p {
    width: 80%;
    max-width: 80%;
    flex-basis: 80%;
  }
}

.body-width {
  max-width: 100vw;
}

.niho-bg {
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.99),
      rgba(255, 255, 255, 0.7)
    ),
    url(../assets/niho.svg);
  background-position-x: 100px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

/* .fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2;
  transition-property: top;
  transition-timing-function: ease-in-out;
 } */

.fade-enter-active {
  transition: all 0.6s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}</style
>22px;
