<template>
  <!-- <v-container class="white mx-auto py-12 px-12 d-flex justify-space-between align-center"> -->
  <v-form class="pt-0">
    <v-container class="white mx-auto pt-12 px-12">
      <v-row class="form">

        <v-col cols="12" md="12" >
          <v-text-field
            light
            v-model="profile.preferredName"
            label="Preferred name"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12" >
          <v-text-field
            light
            v-model="profile.legalName"
            label="Legal name"
          ></v-text-field>
        </v-col>

        <v-col cols="9" md="9" >
          <v-text-field
            light
            v-model="newAltName"
            label="Add another name"
          ></v-text-field>
        </v-col>

        <v-col cols="2" md="2" >
          <v-btn @click="addAltName" fab color="grey">
            <v-icon right>mdi-plus</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="12" md="12">
          <h3 class="black--text">Other names</h3>
          <v-row v-for="name in altNames" :key="name">
            <p
              class="black--text"
            >{{name}}</p>
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="profile.description"
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
const get = require('lodash.get')

export default {
  name: 'ProfileInfoEdit',
  props: {
    edit: Boolean
  },
  data () {
    return {
      newAltName: '',
      profile: {
        preferredName: '',
        legalName: '',
        altNames: [],
        description: ''
      }
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
    addAltName () {
      this.profile.altNames = this.profile.altNames.concat(this.newAltName)
      this.newAltName = ''
    },
    async saveProfile () {
      // Call to the graphql mutation
      let cleanInput = {
        type: 'person'
      }
      await Object.keys(this.profile).map(k => {
        if (k !== '__typename') {
          cleanInput[k] = this.profile[k]
        }
      })
      const result = await this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($input: ProfileInput!) {
          createProfile(input: $input)
        }`,
        // Parameters
        variables: {
          input: cleanInput
        }
      })
      console.log('RES', result)
    },
    cancel () {
      this.$router.push({ name: 'profileShow', params: { id: this.id } })
    }
  },
  computed: {
    altNames () {
      return get(this, 'profile.altNames', [])
    }
    // preferredName () {
    //   return get(this.profile, 'preferredName', '')
    // },
    // legalName () {
    //   if (this.profile) {
    //     return this.profile.legalName || ''
    //   } else return ''
    // },
    // description () {
    //   if (this.profile) {
    //     return this.profile.description || ''
    //   } else return ''
    // }
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
