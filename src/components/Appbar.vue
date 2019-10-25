<template>
    <div>
    <v-toolbar>
      <v-toolbar-title class="d-flex align-center">
        <router-link to="/">
          <img src="../assets/logo_red.svg" />
        </router-link>
        <v-btn icon :to="{ name: 'profileShow', params: { id: profileId } }">
          <Avatar size="50px" :image="profile.avatarImage ? profile.avatarImage.uri : ''" :alt="profile.preferredName" />
        </v-btn>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn text to='/community' class="white--text text-uppercase">
          community
        </v-btn>
        <v-btn text to="/profile" class="white--text text-uppercase">
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
        avatarImage: {
          uri: ''
        }
      },
      profileId: ''
      // profiles: []
    }
  },
  apollo: {
    // profiles: gql`query {
    //   profiles {
    //     id
    //     preferredName
    //     avatarImage
    //     description
    //     type
    //   }
    // }`,
    profileId: {
      query: gql` {
        whoami {
          profileId
        }
      }`,
      update: data => {
        return data.whoami.profileId
      }
    }
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
