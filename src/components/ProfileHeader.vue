<template>
  <div>
    <v-img min-width="100%" max-height="35vh" v-bind:src="profile.headerImage" />
    <div class="avatar">
      <Avatar v-bind:image="profile.avatarImage" v-bind:alt="profile.preferredName" />
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
  data () {
    return {
      profile: {
        preferredName: '',
        avatarImage: '',
        headerImage: ''
      }
    }
  },
  apollo: {
    // Query with parameters
    profile: {
      query: gql`query {
        profile {
          preferredName
          avatarImage
          headerImage
        }
      }`
    }
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
