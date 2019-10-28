<template>
  <v-container class="white py-4 d-flex flex-column align-self-start">
    <v-row class="py-2">
      <v-col cols="3">
        <h2 class="grey--text subtitle-1">Communities</h2>
      </v-col>

      <v-col cols="3 justify-end">
        <v-btn to="/community/new" class="my-2" tile outlined color="primary">
          <v-icon left>mdi-plus</v-icon> Create
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="d-flex flex-row align-start justify-center">
      <v-col v-for="community in communities" :item="community" :key="community.id">
        <router-link :to="{ name: 'communityShow', params: { id: community.id } }">
          <v-card light height="380px" width="300px" >
            <v-img height="150px" :src="getImage(community)" class='card-image'/>
            <v-card-title class="subtitle font-weight-bold">{{community.preferredName}}</v-card-title>
            <v-card-text class="body-2">{{shortDescrciption(community)}}</v-card-text>
          </v-card>
        </router-link>
      </v-col>

      <v-col cols="3 justify-end">
        <v-btn to="/community/new" class="my-2" tile outlined color="primary">
          <v-icon left>mdi-plus</v-icon> Create
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
const get = require('lodash.get')

export default {
  name: 'CommunitiesList',
  data () {
    return {
      communities: []
    }
  },
  apollo: {
    communities: {
      query: gql`query {
        communities {
          id
          preferredName
          description
          headerImage {
            uri
          }
        }
      }`,
      fetchPolicy: 'no-cache'
    }
  },
  methods: {
    getImage (community) {
      return get(community, 'headerImage.uri') || ''
    },
    shortDescrciption (community) {
      if (!community.description) return
      return community.description.substring(0, 180)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .card-image {
    background: linear-gradient(45deg, hsl(0, 6%, 37.1%) 12%, transparent 0, transparent 88%, hsl(0, 6%, 37.1%) 0), linear-gradient(135deg, transparent 37%, hsl(13.5, 4%, 31%) 0, hsl(13.5, 4%, 31%) 63%, transparent 0), linear-gradient(45deg, transparent 37%, hsl(0, 6%, 37.1%) 0, hsl(0, 6%, 37.1%) 63%, transparent 0), hsl(0, 5.2%, 27.6%);
    background-size: 50px 50px;
  }
</style>
