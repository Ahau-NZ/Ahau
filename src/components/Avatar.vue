<template>
  <v-col>
    <v-row justify="center">
      <v-avatar :size="size">
        <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
        <v-img v-else :src="getImage"/>
      </v-avatar>
    </v-row>
    <v-row v-if="showLabel" justify="center">
      {{ alt }}
    </v-row>
  </v-col>
</template>

<script>
import avatarHelper from '@/lib/avatar-helpers.js'

export default {
  name: 'Avatar',
  props: {
    image: Object,
    alt: String,
    size: { type: String, default: '25vh' },
    showLabel: { type: Boolean, default: false },
    gender: String,
    bornAt: String
  },
  computed: {
    getImage () {
      return avatarHelper.defaultImage(this.bornAt, this.gender)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
