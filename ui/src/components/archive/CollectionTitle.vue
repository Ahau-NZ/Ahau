<template>
  <v-col cols="10" class="headliner black--text pa-0 pb-2 mt-n10">
    {{ collection.name + ' collection'}}
    <v-icon color="blue-grey" light @click="showCollection" class="infoButton">mdi-information</v-icon>
  </v-col>
</template>
<script>

import avatarHelper from '@/lib/avatar-helpers.js'

export default {
  name: 'CollectionTitle',
  props: {
    collection: Object
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    getImage () {
      return avatarHelper.defaultImage(this.view, null, null)
    }
  },
  methods: {
    back () {
      const [name] = this.$route.name.split('/:whakapapaId')
      return {
        name,
        params: {
          tribeId: this.$route.params.tribeId,
          profileId: this.$route.params.profileId
        }
      }
    }
  }
}
</script>
