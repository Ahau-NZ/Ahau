<template>
  <v-container class="body-width white mx-auto py-12 px-12">

    <v-row v-for="view in views" :key="view.id">
      <router-link :to="{ name: 'whakapapaShow', params: { id: view.id } }">
        <v-col> {{view.name}} </v-col>
      </router-link>
    </v-row>
    <!-- Don't think this should be here -->
    <!-- <div @click="toggleNodeForm" class="mb-4">
      <v-btn fab >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <span class="black--text pl-4 subtitle">Create new profile</span>
    </div>
    <NewNodeDialog v-if="showNodeForm" :show="showNodeForm"
      @close="toggleNodeForm" @submit="createProfileAndView($event)"/> -->
    <NewViewForm :text="viewWelcomeText" :show="showViewForm" @close="toggleViewForm" @submit="createView($event)" />
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import NewViewForm from '@/components/whakapapa-view/New.vue'
import { getView, concatView } from '@/lib/localStorage'

const saveWhakapapaViewQuery = gql`mutation ($input: WhakapapaViewInput) {
  saveWhakapapaView(input: $input)
}`

// TEMPORARY should be Query for all views

export default {
  name: 'WhakapapaIndex',
  data () {
    return {
      viewWelcomeText: 'Create a new Whakapapa record for your profile',
      views: [],
      showNodeForm: false,
      showViewForm: false,
      focus: null
    }
  },
  mounted () {
    // Temporary localStorage
    this.views = getView()
    if (this.views === undefined || this.views.length === 0 || !this.views[0].id) {
      this.toggleViewForm()
    }
  },
  apollo: {
    focus: {
      query: gql` {
        whoami {
          profile { id }
        }
      }`,
      update: data => data.whoami.profile.id,
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
    // async createProfileAndView ($event) {
    //   try {
    //     const profile = await this.$apollo.mutate({
    //       mutatation: createProfileQuery,
    //       variables: $event
    //     })
    //     if (profile.data) {
    //       const view = await this.$apollo.mutate({
    //         mutation: saveWhakapapaViewQuery,
    //         variables: { input: $event }
    //       })
    //       if (view.data) {
    //         this.$router.push({ name: 'whakapapaShow', params: { id: view.data.saveWhakapapaView } })
    //       } else {
    //         return
    //       }
    //     }
    //   } catch (err) {
    //     throw err
    //   }

    //   // publish view, then navigate to it?
    // },
    async createView ($event) {
      try {
        const result = await this.$apollo.mutate({
          mutation: saveWhakapapaViewQuery,
          variables: {
            input: {
              ...$event,
              focus: this.focus
              // recps: [focus]
            }
          }
        })
        if (result.data) {
          const id = result.data.saveWhakapapaView
          // Temporary localStorage
          concatView({
            id,
            focus: this.focus,
            ...$event
            // recps: [focus]
          })
          this.views = getView()
          // Should it go to the view automatatically?
          // this.$router.push({ name: 'whakapapaShow', params: { id } })
        } else {
          console.log('Something bad happened here...')
          return
        }
      } catch (err) {
        throw err
      }

      // publish view, then navigate to it?
    }
  },
  components: {
    NewViewForm
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
</style>
