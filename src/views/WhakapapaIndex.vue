<template>
  <v-container class="body-width white mx-auto py-12 px-12">

    <v-row v-for="view in views" :key="view.id">
      <router-link :to="{ name: 'whakapapaShow', params: { id: view.id } }">
        <v-col> {{view.name}} </v-col>
      </router-link>
    </v-row>
    <!-- Don't think this should be here -->
    <div @click="toggleViewForm" class="mb-4">
      <v-btn fab >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <span class="black--text pl-4 subtitle">Create new whakapapa</span>
    </div>
    <NewProfileDialog v-if="showNodeForm" :show="showNodeForm"
      @close="toggleNodeForm" @submit="createProfileAndView($event)"/>
    <NewViewForm :show="showViewForm" @close="toggleViewForm" @submit="createWhakapapa($event)" />
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
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
      newView: null,
      views: [],
      showNodeForm: false,
      showViewForm: false,
      whoami: {}
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
    toggleNodeForm () {
      this.showNodeForm = !this.showNodeForm
    },
    toggleViewForm () {
      this.showViewForm = !this.showViewForm
    },
    async createProfileAndView ($event) {
      try {
        const profile = await this.$apollo.mutate({
          mutatation: createProfileQuery,
          variables: $event
        })
        if (profile.data) {
          console.log("TCL: createProfileAndView -> $event", $event)
          const view = await this.$apollo.mutate({
            mutation: saveWhakapapaViewQuery,
            variables: { input: this.newView }
          })
          if (view.data) {
            this.newView = null
            this.$router.push({ name: 'whakapapaShow', params: { id: view.data.saveWhakapapaView } })
          } else {
            return
          }
        }
      } catch (err) {
        throw err
      }

      // publish view, then navigate to it?
    },
    async createWhakapapa ($event) {
      const cleanEvent = {}
      Object.keys($event).forEach(e => {
        if (e !== 'focus') {
          cleanEvent[e] = $event[e]
        }
      })
      switch ($event.focus) {
        case 'self':
          this.createView(cleanEvent)
          break
        case 'new':
          this.toggleNodeForm()
          this.newView = cleanEvent
          break
        default:
      }
    },
    async createView ($event) {
      try {
        const result = await this.$apollo.mutate({
          mutation: saveWhakapapaViewQuery,
          variables: {
            input: {
              ...$event,
              focus: this.whoami.profile.id,
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
</style>
