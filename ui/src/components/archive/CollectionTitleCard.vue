<template>
<v-card light flat rounded class="mx-2 pa-0" width="100%">
  <v-row>
    <v-col cols="12" xs="12" sm="12" md="2" class="py-0">
      <v-img :src="image" cover class="grey darken-4" height="105px">
      </v-img>
    </v-col>
    <v-col cols="12" xs="12" sm="12" md="6" class="pa-0">
      <v-row class="align-center pl-3">
        <h4 class="blue-grey--text text--darken-4 text-uppercase">
          {{ collection.name + ' collection'}}
        </h4>
        <div v-if="collection && collection.canEdit">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="$emit('click')"
                icon
                class="ml-5"
              >
                <v-icon class="blue--text" small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit Collection</span>
          </v-tooltip>
        </div>
      </v-row>
      <div>
        <p
          v-if="collection.description"
          class="black--text mb-0 py-2 caption"
        >
          {{ collection.description }}
        </p>
      </div>
    </v-col>
    <v-col v-if="access && access.length > 0" cols="auto" class="pb-0">
      <v-list-item-subtitle style="color:#a7a3a3">Access</v-list-item-subtitle>
      <AvatarGroup
        style="position:relative; bottom:15px; right:15px"
        :profiles="access"
        show-labels :size="'30px'"
        spacing="pr-2"
      />
    </v-col>
    <v-col v-if="collection.tiaki && collection.tiaki.length > 0" cols="auto" class="pb-0">
      <v-list-item-subtitle style="color:#a7a3a3">Kaitiaki</v-list-item-subtitle>
      <AvatarGroup
        style="position:relative; bottom:15px; right:15px"
        :profiles="collection.tiaki"
        show-labels :size="'30px'"
        spacing="pr-2"
      />
    </v-col>
  </v-row>
  <v-divider light></v-divider>
</v-card>
</template>
    
<script>
import niho from '@/assets/niho.svg'
import AvatarGroup from '@/components/AvatarGroup.vue'
import { getTribalProfile } from '@/lib/community-helpers.js'
import { mapGetters } from 'vuex'
import mapProfileMixins from '@/mixins/profile-mixins.js'


export default {
  name:'CollectionTitleCard',
  components: {
    AvatarGroup
  },
  props: {
    collection: Object,
  },
  mixins: [
    mapProfileMixins({
      mapMethods: ['getTribe']
    }),
  ],
  async mounted () {
       // populate access
    const tribe = await this.getTribe(this.collection.recps[0])
    // get the profile of the tribe
    this.access = [getTribalProfile(tribe, this.whoami)]
  },
  data () {
    return {
      access: null
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    image () {
      // if there is an image return it
      if (
        this.collection &&
        this.collection.image &&
        this.collection.image.uri
      ) {
        return this.collection.image.uri
      }
      // otherwise return a default one
      return niho
    },
  }
}
</script>

<style>

</style>
