<template>
  <v-container class="my-0 py-0">
    <v-row>
      <v-img min-width="100%" height="35vh" v-bind:src="profile.headerImage" />
      <v-btn v-if="edit" class="edit-header" tile color="grey">
        <v-icon right>mdi-pencil</v-icon> Edit header
      </v-btn>
    </v-row>
    <v-row class="avatar">
      <Avatar v-bind:image="profile.avatarImage" v-bind:alt="profile.preferredName" />
      <v-btn v-if="edit" class="edit-avatar" fab color="grey">
        <v-icon right>mdi-pencil</v-icon>
      </v-btn>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'ProfileHeader',
  props: {
    edit: Boolean
  },
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
  .edit-header {
    cursor: pointer;
    position: absolute;
    top: 30vh;
    right: 5vw;
  }
  .edit-avatar {
    cursor: pointer;
    position: absolute;
    top: 17vh;
    left: 1vw;
    z-index: 999;
  }
</style>
