<template>
  <v-banner light single-line color="white"
    :style="{ marginTop: mobile ? 0 : '17px', zIndex: 1 }"
  >
    <router-link :to="back()">
      <v-avatar size="35" tile >
        <v-img v-if="view.image && view.image.uri" :src="view.image.uri" :alt="view.name"/>
        <v-img v-else :src="getImage" />
      </v-avatar>
      <span class="title"> {{ view.name }} </span>
    </router-link>
    <template v-slot:actions>
      <v-btn
        color="primary"
        text
        @click="$emit('more-info')"
        class="mr-10"
      >
      <v-icon large class="grey--text" left>mdi-information</v-icon>
      </v-btn>
    </template>
  </v-banner>
</template>
<script>

import avatarHelper from '@/lib/avatar-helpers'

export default {
  name: 'WhakapapaBanner',
  props: {
    view: Object
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
<style scoped>
.whakapapa-banner {
  margin-top: 17px
}
</style>
