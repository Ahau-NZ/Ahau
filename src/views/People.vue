<template>
  <div class="wrapper">
    <v-container class="d-flex align-center py-12 full-height">
      <v-row>
        <v-col
          v-for="profile in persons"
          :key="profile.id"
          cols="3"
          class="d-flex flex-column align-center"
        >
          <router-link :to="{ name: 'personShow', params: { id: profile.id }}">
            <Avatar class="pointer" :image="profile.avatarImage" :gender="profile.gender" :bornAt="profile.bornAt" size="13vh" />
            <h3 class="pointer">{{ profile.preferredName }}</h3>
          </router-link>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'People',
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
      }`,
      fetchPolicy: 'no-cache'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .wrapper {
    background: white;
  }
  .full-height {
    min-height: 100vh;
  }
  .pointer {
    cursor: pointer;
    color: white;
    text-align: center;
  }
</style>
