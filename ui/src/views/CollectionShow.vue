<template>
  <v-container fluid>
      <v-row v-if="!mobile" style="width:30%;" class="">
        <WhakapapaShowViewCard
          type="collection"
          :view="collection"
          :access="access"
          :shadow="false"
        >
          <template v-slot:edit v-if="collection && collection.canEdit">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  @click.stop="dialog.active = 'collection-edit'"
                  icon
                  class="pa-0 px-3"
                >
                  <v-icon small class="blue--text">mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit Collection</span>
            </v-tooltip>
          </template>
        </WhakapapaShowViewCard>
      </v-row>
      <v-row>
        <v-col cols="12">
          <Stories title="Stories" :stories="stories" @save="$emit('processStory', $event)" />
        </v-col>
      </v-row>
  </v-container>
</template>

<script>
// import mapCollectionMixins from '@/mixins/collection-mixins'
import { getCollection } from '@/lib/story-helpers'
import { getTribalProfile } from '@/lib/community-helpers'

import mapProfileMixins from '@/mixins/profile-mixins.js'

import WhakapapaShowViewCard from '../components/whakapapa/WhakapapaShowViewCard'
import { mapGetters, mapMutations } from 'vuex'
import Stories from '../components/archive/Stories.vue'

export default {
  name: 'CollectionShow',
  // TODO: move to mixin
  mixins: [
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
    WhakapapaShowViewCard,
    Stories
  },
  data () {
    return {
      collection: {},
      access: null,
      dialog: {
        active: null
      }
    }
  },
  computed: {
    ...mapGetters(['whoami']),
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
    ...mapMutations(['setCurrentAccess'])
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
  background: linear-gradient(to right, rgba(255, 255, 255, 0.99),
  rgba(255, 255, 255, 0.7)), url(../assets/niho.svg);
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
  }

</style>22px;
