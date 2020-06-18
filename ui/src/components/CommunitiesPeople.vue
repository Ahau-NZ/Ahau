<template>
  <v-container class="white py-4">
    <!-- <v-container class="white py-4 d-flex flex-column align-start"> -->
    <v-row class="py-2">
      <h2 class="grey--text subtitle-1">People</h2>
    </v-row>

    <v-row justify="start">
      <v-col
        v-for="profile in persons"
        :key="profile.id"
        justify-self="start"
        class="pr-8"
      >
        <router-link
          :to="{ name: 'profileShow', params: { id: profile.id } }"
          class="d-flex flex-column align-center"
        >
          <Avatar
            class="pointer"
            :image="profile.avatarImage"
            :gender="profile.gender"
            :aliveInterval="profile.aliveInterval"
            size="13vh"
          />
          <h3 class="pointer">{{ profile.preferredName }}</h3>
        </router-link>
      </v-col>
    </v-row>

    <!-- <v-row class="d-flex flex-row align-center">
      <v-col v-for="(peer, index) in peers" :item="peer" :index="index" :key="index" >
        <Avatar image="https://picsum.photos/300/300" size="80" />
        <p class="black--text">{{peer.id}}</p>
      </v-col>
    </v-row> -->
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
      query: gql`
        query {
          persons {
            id
            preferredName
            aliveInterval
            gender
            avatarImage {
              uri
            }
          }
        }
      `,
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
.col {
  flex-grow: 0;
}
</style>
