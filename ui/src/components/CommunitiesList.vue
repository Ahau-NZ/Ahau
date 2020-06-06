<template>
  <div class="py-4">

    <!-- CONNECT -->
    <v-row class="py-2">
      <v-col cols="12">
        <p class="headliner pa-0 mb-4">CONNECT</p>
        <p class="sub-headline pa-0">Enter a ĀHAU PĀTAKA code to connect to a digital pātaka</p>
        <v-text-field
          v-model="patakaCode"
          placeholder="xxxx-xxxx-xxxx-xxxx"
          outlined
          light
          dense
          style="width: 50%;"
          append-outer-icon="mdi-lan-connect"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- TRIBES -->
    <v-row >
      <v-col cols="12">
          <p class="headliner pa-0 mb-4">TRIBES</p>
          <v-row justify="start">
              <v-col v-for="community in communities" :item="community" :key="community.id" justify-self="start">
                <router-link :to="{ name: 'communityShow', params: { id: community.id } }">
                  <v-card light height="280px" width="200px">
                    <v-img height="150px" :src="getImage(community)" class="card-image" />
                    <v-card-title class="subtitle font-weight-bold pb-2">{{
                      community.preferredName
                    }}</v-card-title>
                    <v-card-text class="body-2">{{
                      shortDescrciption(community)
                    }}</v-card-text>
                  </v-card>
                </router-link>
              </v-col>
            </v-row>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import gql from 'graphql-tag'

import { communityBasic01, communityBasic02 } from '../mocks/community'

const get = require('lodash.get')

export default {
  name: 'CommunitiesList',
  data () {
    return {
      communities: [],
      patakaCode: null,
      communities: [communityBasic01, communityBasic02]
    }
  },
  // apollo: {
  //   communities: {
  //     query: gql `
  //     query {
  //       communities {
  //         id
  //         preferredName
  //         description
  //         headerImage {
  //           uri
  //         }
  //       }
  //     }
  //   `,
  //     fetchPolicy: 'no-cache'
  //   }
  // },
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
  .col {
    flex-grow: 0;
  }

  .card-image {
    background: linear-gradient(45deg,
        hsl(0, 6%, 37.1%) 12%,
        transparent 0,
        transparent 88%,
        hsl(0, 6%, 37.1%) 0),
      linear-gradient(135deg,
        transparent 37%,
        hsl(13.5, 4%, 31%) 0,
        hsl(13.5, 4%, 31%) 63%,
        transparent 0),
      linear-gradient(45deg,
        transparent 37%,
        hsl(0, 6%, 37.1%) 0,
        hsl(0, 6%, 37.1%) 63%,
        transparent 0),
      hsl(0, 5.2%, 27.6%);
    background-size: 50px 50px;
  }

  .connect-title {
    flex: 1;
  }

  .headliner {
    font-size: 1em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
    color: black;
  }

  .sub-headline {
    font-size: 0.8rem;
    color: rgba(0, 0, 0, 0.6);
  }

  .title {

  }

</style>
