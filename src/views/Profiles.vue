<template>
  <v-container class="d-flex align-center" height="100vh">
    <v-row>
      <v-col
        cols="3"
        class="d-flex flex-column align-center"
        v-for="profile in profiles"
        v-bind:key="profile.id"
        @click="gotoProfile(profile.id)"
      >
        <Avatar image="profile.avatarImage" size="13vh" />
        <h3>{{ profile.preferredName }}</h3>
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
      profiles: []
    }
  },
  apollo: {
    // Query with parameters
    profiles: {
      query: gql`query {
        profiles {
          id
          preferredName
          avatarImage
        }
      }`
    }
  },
  methods: {
    gotoProfile (id) {
      this.$router.push({ name: 'profileShow', params: { id } })
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
