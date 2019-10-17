<template>
  <v-avatar v-bind:size="size" color="indigo">
    <v-img
      v-bind:src="image"
      v-bind:alt="alt"
    />
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
