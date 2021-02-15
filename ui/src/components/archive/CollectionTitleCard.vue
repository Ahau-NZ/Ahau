<template>
<v-card light flat class="mx-6 pa-0">
  <v-row>
    <v-col cols="12" xs="12" sm="12" md="2" class="py-0">
      <v-img :src="image" contain class="grey darken-4">
      </v-img>
    </v-col>
    <v-col cols="12" xs="12" sm="12" md="5" class="pa-0">
      <v-row class="align-center pl-3">
        <h4 class="blue-grey--text text--darken-4 text-uppercase">
          {{ collection.name + ' collection'}}
        </h4>
        <div v-if="collection && collection.canEdit">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click.stop="dialog = 'edit-collection'"
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
    <v-col v-if="access && access.length > 0" cols="auto" class="pb-0">
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


export default {
  name:'CollectionTitleCard',
  components: {
    AvatarGroup
  },
  props: {
    collection: Object,
    access: Object
  },
  computed: {
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
    tiaki () {

    }
  }
}
</script>

<style>

</style>
