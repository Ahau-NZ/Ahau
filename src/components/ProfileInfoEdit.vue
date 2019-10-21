<template>
  <!-- <v-container class="white mx-auto py-12 px-12 d-flex justify-space-between align-center"> -->
  <v-form class="pt-0">
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
            label="Add another name"
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
          <h3 class="black--text">Other names</h3>
          <v-row v-for="name in altNames" v-bind:key="name">
            <p
              class="black--text"
            >{{name}}</p>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="description"
            light
            name="input-7-1"
            label="Description"
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
            @click="cancel"
          >
            <v-icon right>mdi-cancel</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
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
      newAltName: ''
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
    },
    cancel: () => {
      console.log('Canceling')
    }
  },
  computed: {
    preferredName () {
      if (this.profile) {
        return this.profile.preferredName || ''
      } else return ''
    },
    legalName () {
      if (this.profile) {
        return this.profile.legalName || ''
      } else return ''
    },
    altNames () {
      if (this.profile) {
        return this.profile.altNames || ''
      } else return []
    },
    description () {
      if (this.profile) {
        return this.profile.description || ''
      } else return ''
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .form {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
