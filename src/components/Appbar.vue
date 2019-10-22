<template>
    <div>
    <v-toolbar>
      <v-toolbar-title class="d-flex align-center">
        <router-link to="/">
          <img src="../assets/logo_red.svg" />
        </router-link>
        <router-link to="/profile">
          <Avatar size="50px" v-bind:image="profile.avatarImage" v-bind:alt="profile.preferredName" />
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn text>
          <router-link class="white--text text-uppercase" to="/communities">communities</router-link>
        </v-btn>
        <v-btn text>
          <router-link class="white--text text-uppercase" to="/profile">profile</router-link>
        </v-btn>
        <v-btn text>
          <router-link class="white--text text-uppercase" to="/signout">sign out</router-link>
        </v-btn>

      </v-toolbar-items>
    </v-toolbar>
  </div>
</template>

<script>
// import gql from 'graphql-tag'
import Avatar from '@/components/Avatar'

export default {
  name: 'Appbar',
  components: {
    Avatar
  },
  data () {
    return {
      profile: {
        preferredName: '',
        avatarImage: ''
      }
    }
  }
  // apollo: {
  //   // Query with parameters
  //   profile: {
  //     query: gql`query {
  //       profile {
  //         preferredName
  //         avatarImage
  //       }
  //     }`
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  img {
    height: 45px;
    padding: 0 25px;
  }
</style>
