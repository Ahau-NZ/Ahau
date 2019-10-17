<template>
  <div>
    <v-img min-width="100%" max-height="35vh" src="https://picsum.photos/800/600" />
    <div class="avatar">
      <Avatar image="https://picsum.photos/300/300" alt="" />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'ProfileHeader',
  components: {
    Avatar
  },
  apollo: {
    profile: gql`query {
      profile {
        preferredName
        avatarImage
        coverPhoto
      }
    }`
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .avatar {
    position: relative;
    top: -18.75vh;
    // left: 5vw;
    margin-bottom: -25vh;
  }
</style>
