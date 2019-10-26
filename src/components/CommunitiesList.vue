<template>
  <v-container class="white py-4 d-flex flex-column align-self-start">
    <v-row class="py-2">
      <h2 class="grey--text subtitle-1">Communities</h2>
    </v-row>
    <v-row class="d-flex flex-row align-start justify-center">
      <v-col v-for="community in communities" :item="community" :key="community.id">
        <router-link :to="{ name: 'communityShow', params: { id: community.id } }">
          <v-card light height="380px" width="300px" >
            <v-img height="150px" :src="community.headerImage || ''" />
            <v-card-title class="subtitle font-weight-bold">{{community.preferredName}}</v-card-title>
            <v-card-text class="body-2">{{shortDescrciption(community)}}</v-card-text>
          </v-card>
        </router-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'CommunitiesList',
  data () {
    return {
      profile: {
        preferredName: '',
        description: '',
        headerImage: ''
      }
    }
  },
  apollo: {
    communities: {
      query: gql`query {
        communities {
          id
          preferredName
          description
          avatarImage {
            uri
          }
        }
      }`
    }
  },
  methods: {
    shortDescrciption (community) {
      if (!community.description) return
      return community.description.substring(0, 180)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
