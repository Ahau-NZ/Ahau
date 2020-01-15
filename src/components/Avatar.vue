<template>
  <v-col>
    <v-row justify="center">
      <v-avatar :size="size">
        <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
        <v-img v-else :src="defaultImage"/>
      </v-avatar>
    </v-row>
    <v-row v-if="showLabel" justify="center">
      {{ alt }}
    </v-row>
  </v-col>
</template>

<script>
import unknown from '@/assets/unknown.svg'
export default {
  name: 'Avatar',
  props: {
    image: Object,
    alt: String,
    size: { type: String, default: '25vh' },
    showLabel: { type: Boolean, default: false }
  },
  computed: {
    defaultImage () {
      return unknown
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
