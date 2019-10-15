<template>
  <div class="wrapper">
    <div class="cover" />
    <div class="avatar" />
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'ProfileHeader',
  apollo: {
    profile: gql`query {
      profile {
        coverPhoto
        avatarPhoto
      }
    }`
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
