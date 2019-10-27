<template>
  <v-container class="body-width white mx-auto py-12 px-12 d-flex justify-space-between align-center">
    <v-row>
      <v-col cols="8">
        <h1 class="primary--text">{{profile.preferredName}}</h1>
        <v-row>
          <v-col cols="6">
            <h3 class="primary--text caption">Legal name</h3>
            <p class="primary--text body-1">{{profile.legalName}}</p>
          </v-col>
          <v-col cols="6">
            <h3 class="primary--text caption">Other names</h3>
            <p class="primary--text body-1">{{altNames}}</p>
          </v-col>
        </v-row>
        <v-card
          light
          min-height="200px"
        >
          <v-card-title class="headline font-weight-bold">About</v-card-title>
          <v-card-text>{{profile.description}}</v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="profile.canEdit" cols="4 justify-end">
        <router-link :to="{ name: 'profileEdit', params: { id } }">
          <v-btn class="my-2" tile outlined color="primary">
            <v-icon left>mdi-pencil</v-icon> Edit
          </v-btn>
        </router-link>
        <v-card
          min-height="200px"
          light
        >
          <v-card-title class="headline">Communities</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
const get = require('lodash.get')

export default {
  name: 'ProfileInfo',
  props: {
    edit: Boolean,
    id: String
  },
  data () {
    return {
      profile: {
        preferredName: '',
        legalName: '',
        altNames: [],
        description: '',
        canEdit: false
      }
    }
  },
  apollo: {
    profile: {
      query: gql`query ProfileData($id: String!) {
        profile(id: $id) {
          preferredName
          legalName
          altNames
          description
          canEdit
        }
      }`,
      variables () {
        return {
          id: this.id
        }
      },
      fetchPolicy: 'no-cache'
    }
  },
  computed: {
    altNames () {
      const names = get(this, 'profile.altNames')
      // NOTE get's defaultValue doesn't work if value returned is null
      return names ? names.join(', ') : ''
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
</style>
