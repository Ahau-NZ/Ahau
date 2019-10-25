<template>
    <div>
    <v-toolbar>
      <v-toolbar-title class="d-flex align-center">
        <router-link to="/">
          <img src="../assets/logo_red.svg" />
        </router-link>

        <!-- <router-link :to="{ name: 'profileShow', params: { id: profileId } }"> -->
        <!--   <Avatar size="50px" :image="profile.avatarImage" :alt="profile.preferredName" /> -->
        <!-- </router-link> -->
        <v-btn icon :to="{ name: 'profileShow', params: { id: profileId } }">
          <Avatar size="50px" :image="profile.avatarImage" :alt="profile.preferredName" />
        </v-btn>
        <!-- <router-link class="px-1" v-for="profile in profiles" :key="profile.id" :to="{ name: 'profileShow', params: { id: profile.id }}"> -->
        <!--   <Avatar size="50px" :image="profile.avatarImage" :alt="profile.preferredName" /> -->
        <!-- </router-link> -->
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>
        <v-btn text to='/community?page=local' class="white--text text-uppercase">
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
        avatarImage: ''
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
