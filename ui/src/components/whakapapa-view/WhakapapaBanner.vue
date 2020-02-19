<template>
  <v-banner light single-line>
    <v-avatar size="35" tile>
      <v-img v-if="view.image && view.image.uri" :src="view.image.uri" :alt="view.name" />
      <v-img v-else :src="getImage" />
    </v-avatar>
    {{ view.name }}
    <template v-slot:actions>
      <v-btn
        @click.prevent="$emit('edit')"
        align="right"
        color="white"
        text
        small
        class="blue--text edit"
      >
        <v-icon small class="blue--text" left>mdi-pencil</v-icon>
        Edit
      </v-btn>
      <v-btn
        color="primary"
        text
        small
        @click="$emit('more-info')"
      >
        More info
      </v-btn>
    </template>
  </v-banner>
</template>
<script>

import avatarHelper from '@/lib/avatar-helpers.js'

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
  }
}
</script>
