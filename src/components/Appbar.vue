<template>
    <div>
    <v-toolbar>
      <v-toolbar-title class="d-flex align-center">
        <router-link to="/">
          <img src="../assets/logo_red.svg" />
        </router-link>
        <v-btn icon :to="{ name: 'profileShow', params: { id: profile.id } }">
          <Avatar size="50px" :image="profile.avatarImage" :alt="profile.preferredName" />
        </v-btn>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn text to='/community?page=local' class="white--text text-uppercase">
          communities
        </v-btn>
        <v-btn text to="/profile" class="white--text text-uppercase">
          people
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
        id: null,
        avatarImage: null
      }
    }
  },
  apollo: {
    profile: {
      query: gql` {
        whoami {
          profile {
            id
            preferredName
            avatarImage {
              uri
            }
          }
        }
      }`,
      update (data) {
        return data.whoami.profile
      },
      fetchPolicy: 'no-cache'
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
