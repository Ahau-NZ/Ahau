<template>
  <v-avatar :size="size" color="indigo">
    <v-img v-if="image" :src="image || undefined" :alt="alt" />
    <span v-else-if="alt">{{alt.substring(0,1)}}</span>
  </v-avatar>
</template>

<script>
export default {
  name: 'Avatar',
  props: {
    image: String,
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
