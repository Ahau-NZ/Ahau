<template>
<v-card light flat rounded class="mx-2 pa-0" width="100%">
  <v-row style="height:100px">
    <v-col cols="12" xs="12" sm="12" md="2" class="pa-0">
      <v-img :src="image" cover class="grey darken-4" height="100px">
      </v-img>
    </v-col>

    <v-col cols="12" xs="12" sm="12" md="6" class="py-0">
      <v-row class="align-center pl-3">
        <h4 class="blue-grey--text text--darken-4 text-uppercase">
          {{ collection.name + ' collection'}}
        </h4>
        <div v-if="collection && collection.isKaitiaki">
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
      <div class="description">
        <p
          v-if="collection.description"
          class="black--text mb-0 py-2 caption line-clamp"
        >
          {{ collection.description }}
        </p>
      </div>
    </v-col>

    <v-spacer />

    <v-col v-if="access && access.length && desktop" cols="auto" class="pb-0">
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
import { mapGetters } from 'vuex'

export default {
  name: 'CollectionTitleCard',
  components: {
    AvatarGroup
  },
  props: {
    collection: Object
  },
  computed: {
    ...mapGetters(['whoami', 'isKaitiaki']),
    ...mapGetters('tribe', ['tribeProfile']),
    desktop () {
      return this.$vuetify.breakpoint.lg
    },
    access () {
      return [this.tribeProfile].filter(Boolean)
    },
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
    }
  }
}
</script>

<style scoped>
.description {
  width: 100%;
  overflow: hidden;
}

.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
