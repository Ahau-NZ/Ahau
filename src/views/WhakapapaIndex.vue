<template>
  <v-container class="body-width white mx-auto py-12 px-12">
    <v-row v-for="view in views" :key="view.id" dense>
      <v-col cols="12">
        <v-card
          :to="{ name: 'whakapapaShow', params: { id: view.id } }"
          color="primary"
        >
          <v-card-title class="headline">{{ view.name }}</v-card-title>
          <v-card-subtitle>{{ view.description }} </v-card-subtitle>

<!--
          <v-card-actions>
            <v-btn text> Edit </v-btn>
          </v-card-actions>
          -->
        </v-card>
      </v-col>
    </v-row>

    <!-- Don't think this should be here -->
    <div @click="toggleViewForm" class="mt-8 mb-4">
      <v-btn fab >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <span class="pointer black--text pl-4 subtitle">Create new whakapapa</span>
    </div>

    <NewViewForm :show="showViewForm" @close="toggleViewForm" @submit="handleStepOne($event)" />
    <NewProfileDialog v-if="showProfileForm" :show="showProfileForm"
      @close="toggleProfileForm" @submit="handleDoubleStep($event)"/>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import pick from 'lodash.pick'
import lock from '@/assets/lock.svg'
import NewViewForm from '@/components/whakapapa-view/New.vue'
import NewProfileDialog from '@/components/profile-form/Dialog.vue'

const saveWhakapapaViewQuery = gql`mutation ($input: WhakapapaViewInput) {
  saveWhakapapaView(input: $input)
}`

const createProfileQuery = gql`mutation ($input: CreateProfileInput!) {
  createProfile(input: $input)
}`

// TEMPORARY should be Query for all views

export default {
  name: 'WhakapapaIndex',
  data () {
    return {
      views: [],

      whoami: {},
      showProfileForm: false,
      showViewForm: false,
      newView: null
    }
  },
  apollo: {
    whoami: {
      query: gql` {
        whoami {
          profile { id }
          feedId
        }
      }`,
      fetchPolicy: 'no-cache'
    },
    views: {
      query: gql` {
        views {
          id
          name
          description
        }
      }`,
      fetchPolicy: 'no-cache'
    }
  },
  methods: {
    toggleProfileForm () {
      this.showProfileForm = !this.showProfileForm
    },
    toggleViewForm () {
      this.showViewForm = !this.showViewForm
    },
    async handleStepOne ($event) {
      const input = pick($event, ['name', 'description', 'mode'])
      switch ($event.focus) {
        case 'self':
          input.focus = this.whoami.profile.id
          return this.createView(input)
        case 'new':
          this.newView = input
          return this.toggleProfileForm()
        default:
      }
    },
    async createView (input) {
      try {
        const result = await this.$apollo.mutate({
          mutation: saveWhakapapaViewQuery,
          variables: {
            input: {
              ...input,
              mode: 'descendants', // HARD coded at the moment
              recps: [this.whoami.feedId]
            }
          }
        })
        if (!result.data) {
          console.log('Something bad happened here...')
          return
        }

        this.$router.push({ name: 'whakapapaShow', params: { id: result.data.saveWhakapapaView } })
      } catch (err) {
        throw err
      }
      // publish view, then navigate to it?
    },
    async handleDoubleStep ($event) {
      try {
        const res = await this.$apollo.mutate({
          mutation: createProfileQuery,
          variables: {
            input: {
              ...$event,
              type: 'person'
            }
          }
        })
        if (res.errors) {
          console.log('failed to create profile', res)
          return
        }

        this.createView({
          ...this.newView,
          focus: res.data.createProfile
        })
      } catch (err) {
        throw err
      }
    }
  },
  components: {
    NewViewForm,
    NewProfileDialog
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
  .pointer {
    cursor: pointer;
  }

</style>
