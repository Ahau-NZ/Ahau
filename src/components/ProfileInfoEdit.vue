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

        <!-- <v-col cols="9" md="9" > -->
        <!--   <v-text-field -->
        <!--     light -->
        <!--     v-model="newAltName" -->
        <!--     label="Add another name" -->
        <!--   ></v-text-field> -->
        <!-- </v-col> -->

        <!-- <v-col cols="2" md="2" > -->
        <!--   <v-btn @click="addAltName" fab color="grey"> -->
        <!--     <v-icon>mdi-plus</v-icon> -->
        <!--   </v-btn> -->
        <!-- </v-col> -->

        <!-- <v-col cols="12" md="12"> -->
        <!--   <h3 class="black--text">Other names</h3> -->
        <!--   <v-row v-for="name in altNames" :key="name"> -->
        <!--     <p -->
        <!--       class="black--text" -->
        <!--     >{{name}}</p> -->
        <!--   </v-row> -->
        <!-- </v-col> -->

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
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn
            color="success"
            class="mr-4"
            @click="goToShow"
          >
            <v-icon>mdi-cancel</v-icon>
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
    id: String,
    edit: Boolean
  },
  data () {
    return {
      newAltName: '',
      profile: {
        id: '',
        preferredName: '', // ideually these would be null to start with to make change detection from persisted state easier
        legalName: '',
        altNames: [],
        description: ''
      },
      persistedState: {}
    }
  },
  apollo: {
    // Query with parameters
    persistedState: {
      query: gql`query ProfileData($id: String!) {
        profile(id: $id) {
          id
          preferredName
          legalName
          altNames
          description
        }
      }`,
      variables () {
        return {
          id: this.id
        }
      },
      update: data => data.profile
    }
  },
  watch: {
    persistedState (nextValue) {
      Object.entries(nextValue)
        .filter(([key]) => !key.startsWith('_'))
        .forEach(([key, value]) => {
          if (value !== null) this.profile[key] = value
        })
    }
  },
  methods: {
    // addAltName () {
    //   this.profile.altNames = this.profile.altNames.concat(this.newAltName)
    //   this.newAltName = ''
    // },
    async saveProfile () {
      // Call to the graphql mutation
      let changes = {}
      Object.entries(this.profile).map(([key, value]) => {
        if (value !== this.persistedState[key]) {
          changes[key] = value
        }
        // TODO: special case for altNames
      })
      // TODO call it off if there are no changes!

      console.log(changes)

      const result = await this.$apollo.mutate({
        // Query
        // TODO figure out if this is a create or update!
        // TODO include the key you're updating!
        mutation: gql`mutation ($input: UpdateProfileInput!) {
          updateProfile(input: $input)
        }`,
        // Parameters
        variables: {
          input: {
            id: this.profile.id,
            ...changes
          }
        }
      })
      console.log('RES', result)
      if (result.data) this.goToShow()
    },
    goToShow () {
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
