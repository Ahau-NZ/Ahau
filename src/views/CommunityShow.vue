<template>
  <div>
    <ProfileHeaderShow :preferredName="profile.preferredName" :headerImage="profile.headerImage" :avatarImage="profile.avatarImage"/>
    <v-container class="white mx-auto py-12 px-12 d-flex justify-space-between align-center">
      <v-row>
        <v-col cols="8">
          <h1 class="primary--text">{{profile.preferredName}}</h1>
          <v-row>
            <v-col cols="6">
              <h3 class="primary--text caption">Legal name</h3>
              <p class="primary--text body-1">{{profile.legalName}}</p>
            </v-col>
            <!-- <v-col cols="6"> -->
            <!--   <h3 class="primary--text caption">Other names</h3> -->
            <!--   <p class="primary--text body-1">{{altNames}}</p> -->
            <!-- </v-col> -->
          </v-row>
          <v-card
            light
            min-height="200px"
          >
            <v-card-title class="headline font-weight-bold">About</v-card-title>
            <v-card-text>
              <p v-for="(p, i) in splitParagraphs(profile.description)" :key="i + p">
                {{p}}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col  cols="4 justify-end">
          <router-link v-if="profile.canEdit" :to="{ name: 'communityEdit', params: { id } }">
            <v-btn class="my-2" tile outlined color="primary">
              <v-icon left>mdi-pencil</v-icon> Edit
            </v-btn>
          </router-link>

          <!-- <v-card min-height="200px" light > -->
          <!--   <v-card-title class="headline">Communities</v-card-title> -->
          <!-- </v-card> -->
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import ProfileHeaderShow from '@/components/ProfileHeaderShow'
// const get = require('lodash.get')

export default {
  name: 'CommmunityShow',
  data () {
    return {
      id: this.$route.params.id,
      profile: {
        id: '',
        type: '',
        canEdit: false,

        preferredName: '',
        legalName: '',
        description: '',

        avatarImage: undefined,
        headerImage: undefined
      }
    }
  },
  apollo: {
    profile: {
      query: gql`query ProfileData($id: String!) {
        profile(id: $id) {
          id
          type
          canEdit

          preferredName
          legalName
          description

          headerImage {
            uri
          }
          avatarImage {
            uri
          }
        }
      }`,
      variables () {
        return {
          id: this.$route.params.id
        }
      },
      fetchPolicy: 'no-cache'
    }
  },
  methods: {
    splitParagraphs (text) {
      if (!text) return

      return text.split('\n')
    }
  },
  components: {
    ProfileHeaderShow
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
