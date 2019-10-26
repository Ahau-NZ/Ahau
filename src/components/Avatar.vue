<template>
  <v-avatar :size="size" color="indigo">
    <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
  </v-avatar>
</template>

<script>
export default {
  name: 'Avatar',
  props: {
    image: Object,
    alt: String,
    size: {
      type: String,
      default: '25vh'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
