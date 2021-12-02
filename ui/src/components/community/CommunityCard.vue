<template>
  <v-card flat class="rounded-border"
    :width="!mobile ? '190px':'100vw'"
    elevation="4"
    light
    @click="$emit('click')">
    <v-img height="150px" :src="image" class="card-image" />
    <v-card-title class="subtitle font-weight-bold pb-2">
      {{ community.preferredName }}
    </v-card-title>
    <v-card-text class="body-2">
      {{ description }}
    </v-card-text>
  </v-card>
</template>

<script>
import whakapapa from '@/assets/whakapapa.png'
const get = require('lodash.get')

export default {
  name: 'CommunityCard',
  props: {
    community: Object,
    tribeId: String
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    description () {
      if (!this.community.description) return ''
      return this.community.description.substring(0, 180)
    },
    image () {
      return get(this.community, 'avatarImage.uri') || whakapapa
    }
  }
}
</script>

<style scoped>
.col {
  flex-grow: 0;
}
.subtitle {
  word-break: break-word;
}
.card-image {
  background: linear-gradient(
      45deg,
      hsl(0, 6%, 37.1%) 12%,
      transparent 0,
      transparent 88%,
      hsl(0, 6%, 37.1%) 0
    ),
    linear-gradient(
      135deg,
      transparent 37%,
      hsl(13.5, 4%, 31%) 0,
      hsl(13.5, 4%, 31%) 63%,
      transparent 0
    ),
    linear-gradient(
      45deg,
      transparent 37%,
      hsl(0, 6%, 37.1%) 0,
      hsl(0, 6%, 37.1%) 63%,
      transparent 0
    ),
    hsl(0, 5.2%, 27.6%);
  background-size: 50px 50px;
}
.rounded-border {
  color: black;
  border-radius: 10px;
  background-color: white;
  border: none
}
</style>
