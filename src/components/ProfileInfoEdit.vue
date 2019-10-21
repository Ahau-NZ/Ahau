<template>
  <!-- <v-container class="white mx-auto py-12 px-12 d-flex justify-space-between align-center"> -->
  <v-form v-model="valid" class="pt-0">
    <v-container class="white mx-auto pt-12 px-12">
      <v-row class="form">
        <v-col
          cols="12"
          md="12"
        >
          <v-text-field
            light
            v-model="preferredName"
            label="Preferred name"
          ></v-text-field>
        </v-col>

        <v-col
          cols="12"
          md="12"
        >
          <v-text-field
            light
            v-model="legalName"
            label="Last name"
          ></v-text-field>
        </v-col>

        <v-col
          cols="9"
          md="9"
        >
          <v-text-field
            light
            v-model="newAltName"
            label="Other name"
          ></v-text-field>
        </v-col>
        <v-col
          cols="2"
          md="2"
        >
          <v-btn fab color="grey">
            <v-icon right>mdi-plus</v-icon>
          </v-btn>
        </v-col>
        <v-col cols="12" md="12">
          <v-row v-for="name in altNames" v-bind:key="name">
            <v-text-field
              light
              v-model="altNames"
              label="E-mail"
            ></v-text-field>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="description"
            light
            name="input-7-1"
            label="Description"
            value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."
            hint="Hint text"
          ></v-textarea>
        </v-col>
        <v-col cols="12">
          <v-btn
            color="success"
            class="mr-4"
            @click="saveProfile"
          >
            <v-icon right>mdi-check</v-icon>
          </v-btn>
          <v-btn
            color="success"
            class="mr-4"
            @click="saveProfile"
          >
            <v-icon right>mdi-cancel</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
    <!-- <v-row>
      <v-col cols="8">
        <h1 class="primary--text">{{profile.preferredName}}</h1>
        <v-row>
          <v-col cols="6">
            <h3 class="primary--text caption">Legal name</h3>
            <p class="primary--text body-1">{{profile.legalName}}</p>
          </v-col>
          <v-col cols="6">
            <h3 class="primary--text caption">Other names</h3>
            <p class="primary--text body-1">{{profile.altNames.join(', ')}}</p>
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
      <v-col  v-if="!edit" cols="4 justify-end">
        <v-card
          min-height="200px"
          light
        >
          <v-card-title class="headline">Communities</v-card-title>
        </v-card>
      </v-col>
    </v-row> -->
  <!-- </v-container> -->
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'ProfileHeader',
  props: {
    edit: Boolean
  },
  data () {
    return {
      profile: {
        preferredName: '',
        legalName: '',
        altNames: [],
        description: ''
      },
      newAltName: '',
      valid: false,
      preferredName: '',
      legalName: '',
      altNames: [],
      description: ''
    }
  },
  apollo: {
    // Query with parameters
    profile: {
      query: gql`query {
        profile {
          preferredName
          legalName
          altNames
          description
        }
      }`
    }
  },
  methods: {
    saveProfile: () => {
      console.log('Saving')
    }
  }
  // computed () {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .form {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
