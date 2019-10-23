<template>
    <div>
    <v-toolbar>
      <v-toolbar-title class="d-flex align-center">
        <router-link to="/">
          <img src="../assets/logo_red.svg" />
        </router-link>
        <router-link :to="{ name: 'profileShow', params: { id: whoami } }">
          <Avatar size="50px" :image="profile.avatarImage" :alt="profile.preferredName" />
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn text to='/community' class="white--text text-uppercase">
          community
        </v-btn>
        <v-btn text :to="{ name: 'profileShow', params: { id: whoami } }" class="white--text text-uppercase">
          profile
        </v-btn>
        <v-btn text to="/signout" class="white--text text-uppercase">
          sign out
        </v-btn>

      </v-toolbar-items>
    </v-toolbar>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar'

export default {
  name: 'Appbar',
  data () {
    return {
      profile: {
        preferredName: '',
        avatarImage: '',
        whoami: ''
      }
    }
  },
  apollo: {
    whoami: gql`
      query {
        whoami
      }`
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
  },
  components: {
    Avatar
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  img {
    height: 45px;
    padding: 0 25px;
  }
</style>
