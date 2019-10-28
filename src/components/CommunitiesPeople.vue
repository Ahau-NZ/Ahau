<template>
  <v-container class="white py-4 d-flex flex-column align-start">
    <v-row class="py-2">
      <h2 class="grey--text subtitle-1">People</h2>
    </v-row>

    <v-container class="d-flex align-center py-12">
      <v-row class="d-flex justify-left">
        <v-col
          v-for="profile in persons"
          :key="profile.id"
          cols="3"
        >
          <router-link :to="{ name: 'personShow', params: { id: profile.id }}" class="d-flex flex-column align-center">
            <Avatar class="pointer" :image="profile.avatarImage" size="13vh" />
            <h3 class="pointer">{{ profile.preferredName }}</h3>
          </router-link>
        </v-col>
      </v-row>
    </v-container>

    <v-row class="d-flex flex-row align-center">
      <v-col v-for="(peer, index) in peers" :item="peer" :index="index" :key="index" >
        <Avatar image="https://picsum.photos/300/300" size="80" />
        <p class="black--text">{{peer.id}}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar'

export default {
  name: 'CommunitiesPeople',
  components: {
    Avatar
  },
  data () {
    return {
      persons: []
    }
  },
  apollo: {
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

    // Subscriptions
    // $subscribe: {
    //   peers: {
    //     query: gql`subscription {
    //       peers {
    //         id
    //         state
    //       }
    //     }`,
    //     result ({ data }) {
    //       this.peers = data.peers
    //     }
    //   }
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
