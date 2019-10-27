<template>
  <v-container class="d-flex align-center py-12" height="100vh">
    <v-row>
      <v-col
        v-for="profile in persons"
        :key="profile.id"
        cols="3"
        class="d-flex flex-column align-center"
      >
        <router-link :to="{ name: 'profileShow', params: { id: profile.id }}">
          <Avatar class="pointer" :image="profile.avatarImage" size="13vh" />
          <h3 class="pointer">{{ profile.preferredName }}</h3>
        </router-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'Profile',
  components: {
    Avatar
  },
  data () {
    return {
      persons: []
    }
  },
  apollo: {
    // Query with parameters
    persons: {
      query: gql`query {
        persons {
          id
          preferredName
          avatarImage {
            uri
          }
        }
      }`
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .pointer {
    cursor: pointer;
    color: white;
    text-align: center;
  }
</style>
