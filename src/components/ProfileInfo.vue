<template>
  <v-container class="white mx-auto py-12 px-12 d-flex justify-space-between align-center">
    <v-row>
      <v-col cols="8">
        <h1 class="primary--text">{{preferredName || 'Ben'}}</h1>
        <v-row>
          <v-col cols="6">
            <h3 class="primary--text caption">Legal name</h3>
            <p class="primary--text body-1">{{legalName || 'Legal name'}}</p>
          </v-col>
          <v-col cols="6">
            <h3 class="primary--text caption">Other names</h3>
            <p class="primary--text body-1">{{altNames || 'Alternative names'}}</p>
          </v-col>
        </v-row>
        <v-card
          light
          min-height="200px"
        >
          <v-card-title class="headline font-weight-bold">About</v-card-title>
          <v-card-text>Listen to your favorite artists and albums whenever and wherever, online and offline.</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4 justify-end">
        <v-btn class="my-2" tile outlined color="primary">
          <v-icon left>mdi-pencil</v-icon> Edit
        </v-btn>
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

export default {
  name: 'ProfileHeader',
  apollo: {
    profile: gql`query {
      profile {
        preferredName
        legalName
        altNames
      }
    }`
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
