<template>
  <div
    :class="{
      'body-width': mobile,
      'fill-height': mobile,
      white: mobile
    }"
  >
    <v-container
      :class="{
        'desktopContainer': !mobile,
        'mobileContainer': mobile
      }"
      class="body-width white mx-auto"
      style="position:relative"
    >
    <v-row class="pa-5" light>
        <v-col class="headliner black--text pa-0">
        Whakapapa records
        </v-col>
        <v-col align="right" class="pa-0">
          <v-icon  color="blue-grey" light @click="toggleWhakapapaHelper">mdi-information</v-icon>
        </v-col>
    </v-row>

      <div
        v-if="!views || (views && views.length < 1)"
        class="px-8 py-12 subtitle grey--text "
        :class="{
          'text-center': mobile
        }"
      >
        No whakapapa record found
      </div>
      <v-row v-for="view in views" :key="view.id" dense class="mb-2">
        <v-col cols="12">
          <WhakapapaViewCard :view="view" cropDescription />
        </v-col>
      </v-row>

      <!-- Don't think this should be here -->
      <div
        @click="toggleViewForm"
        :class="{
          'text-center': mobile
        }"
        class="mt-8 mb-4"
      >
        <v-btn fab small>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <span class="pointer black--text pl-4 subtitle"
          >Create new whakapapa</span
        >
      </div>

      <NewViewDialog
        :show="showViewForm"
        title="Create a new whakapapa"
        @close="toggleViewForm"
        @submit="handleStepOne($event)"
      />
      <!-- TODO: add suggestions in here as well? -->
      <NewNodeDialog
        v-if="showProfileForm"
        :show="showProfileForm"
        :suggestions="suggestions"
        @getSuggestions="getSuggestions"
        title="Create new Person"
        @create="handleDoubleStep($event)"
        :withRelationships="false"
        @close="toggleProfileForm"
      />

      <WhakapapaListHelper
        :show="showWhakapapaHelper"
        @close="toggleWhakapapaHelper"
      />

    </v-container>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import WhakapapaViewCard from '@/components/whakapapa-view/WhakapapaViewCard.vue'
import NewViewDialog from '@/components/dialog/whakapapa/NewViewDialog.vue'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import WhakapapaListHelper from '@/components/dialog/whakapapa/WhakapapaListHelper.vue'

import tree from '@/lib/tree-helpers'

const saveWhakapapaViewQuery = gql`
  mutation($input: WhakapapaViewInput) {
    saveWhakapapaView(input: $input)
  }
`

const saveProfileQuery = gql`
  mutation($input: ProfileInput!) {
    saveProfile(input: $input)
  }
`

// TEMPORARY should be Query for all views

export default {
  name: 'WhakapapaIndex',
  data () {
    return {
      suggestions: [],
      items: [
        { src: require('../assets/tree.jpg') },
        { src: require('../assets/whakapapa-list.jpg') }
      ],
      views: [],

      whoami: {},
      showWhakapapaHelper: false,
      showProfileForm: false,
      showViewForm: false,
      newView: null
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  apollo: {
    whoami: {
      query: gql`
        {
          whoami {
            profile {
              id
            }
            feedId
          }
        }
      `,
      fetchPolicy: 'no-cache'
    },
    views: {
      query: gql`
        {
          whakapapaViews {
            id
            name
            description
            image {
              uri
            }
          }
        }
      `,
      update: data => data.whakapapaViews,
      fetchPolicy: 'no-cache'
    }
  },
  methods: {
    async getSuggestions ($event) {
      if (!$event) {
        this.suggestions = []
        return
      }

      var records = await this.findByName($event)

      if (isEmpty(records)) {
        this.suggestions = []
        return
      }

      var profiles = {} // flatStore for these suggestions

      records.forEach(record => {
        record.children = record.children.map(child => {
          profiles[child.profile.id] = child.profile // add this records children to the flatStore
          return child.profile.id // only want the childs ID
        })
        record.parents = record.parents.map(parent => {
          profiles[parent.profile.id] = parent.profile // add this records parents to the flatStore
          return parent.profile.id // only want the parents ID
        })
        profiles[record.id] = record // add this record to the flatStore
      })

      // hydrate all the left over records
      records = records.map(record => {
        return tree.hydrate(record, profiles) // needed to hydrate to fix all dates
      })

      // sets suggestions which is passed into the dialogs
      this.suggestions = Object.assign([], records)
    },
    async findByName (name) {
      const request = {
        query: gql`
          query($name: String!) {
            findPersons(name: $name) {
              id
              preferredName
              legalName
              gender
              bornAt
              diedAt
              birthOrder
              description
              altNames
              avatarImage { uri }
              children {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  bornAt
                  diedAt
                  birthOrder
                  description
                  altNames
                  avatarImage { uri }
                }
                relationshipType
              }
              parents {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  bornAt
                  diedAt
                  birthOrder
                  description
                  altNames
                  avatarImage { uri }
                }
                relationshipType
              }
            }
          }
        `,
        variables: {
          name: name
        },
        fetchPolicy: 'no-cache'
      }

      try {
        const result = await this.$apollo.query(request)
        if (result.errors) {
          console.error('WARNING, something went wrong')
          console.error(result.errors)
          return
        }
        return result.data.findPersons
      } catch (e) {
        console.error('WARNING, something went wrong, caught it')
        console.error(e)
      }
    },
    toggleWhakapapaHelper () {
      this.showWhakapapaHelper = !this.showWhakapapaHelper
    },
    toggleProfileForm () {
      this.showProfileForm = !this.showProfileForm
    },
    toggleViewForm () {
      if (!this.showViewForm && this.mobile) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      }
      this.showViewForm = !this.showViewForm
    },
    async handleStepOne ($event) {
      this.newView = {
        ...pick($event, ['name', 'description', 'image']),
        focus: this.whoami.profile.id,
        mode: 'descendants', // HARD coded at the moment
        recps: [this.whoami.feedId] // TODO change this for groups
      }

      switch ($event.focus) {
        case 'self':
          return this.createView(this.newView)
        case 'new':
          return this.toggleProfileForm()
        default:
      }
    },
    async createView (input) {
      const pruned = {}
      Object.entries(input).forEach(([key, value]) => {
        if (!isEmpty(value)) pruned[key] = value
      })

      try {
        const result = await this.$apollo.mutate({
          mutation: saveWhakapapaViewQuery,
          variables: {
            input: pruned
          }
        })
        if (!result.data) {
          console.log('Something bad happened here...')
          return
        }

        this.$router.push({
          name: 'whakapapaShow',
          params: { id: result.data.saveWhakapapaView }
        })
      } catch (err) {
        throw err
      }
    },
    async handleDoubleStep ($event) {
      try {
        var { id } = $event

        if (!id) {
          const res = await this.$apollo.mutate({
            mutation: saveProfileQuery,
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

          id = res.data.saveProfile
        }

        this.createView({
          ...this.newView,
          focus: id
        })
      } catch (err) {
        throw err
      }
    }
  },
  components: {
    WhakapapaViewCard,
    NewViewDialog,
    NewNodeDialog,
    WhakapapaListHelper
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

.cover-image {
  min-width: 150px;
  width: 150px;
  background-color: #fff;
  background-position: center center;
}

.headliner {
  font-size: 1em;
  text-transform: uppercase;
  font-weight: 400;
  letter-spacing: 5px;
}

.desktopContainer {
  margin-top: 64px;
  border: 3px solid red;
}

.mobileContainer {
  padding: 0px;
}

</style>
