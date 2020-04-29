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
        title="Add a Person"
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
import * as d3 from 'd3'
import WhakapapaViewCard from '@/components/whakapapa-view/WhakapapaViewCard.vue'
import NewViewDialog from '@/components/dialog/whakapapa/NewViewDialog.vue'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import WhakapapaListHelper from '@/components/dialog/whakapapa/WhakapapaListHelper.vue'
import { saveWhakapapaLink } from '@/lib/link-helpers.js'

import tree from '@/lib/tree-helpers'
import { mapMutations } from 'vuex'

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
      newView: null,
      columns: [],
      processingQueue: false
    }
  },
  mounted () {
    // reset nestedWhakapapa
    this.setNestedWhakapapa([])
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
            focus
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
  watch: {
    processingQueue: function (isProcessing) {
      if (!isProcessing) return
      while (this.recordQueue.length) {
        const record = this.recordQueue.shift()

      }

      this.processingQueue = false
    }
  },
  methods: {
    ...mapMutations(['setNestedWhakapapa', 'setLoading']),
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

      records = records.map(record => {
        let obj = {}
        let profile = record
        obj = { profile }
        return obj
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
        case 'file':
          return this.buildFromFile($event.csv)
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
    },
    async buildFromFile (csv) {
      // create profile for each person
      var profilesArray = await this.createProfiles(csv)
      profilesArray['columns'] = this.columns

      // create obj of children and parents
      var root = d3.stratify()
        .id(function (d) { return d.number })
        .parentId(function (d) { return d.parentNumber })(profilesArray)

      // create new array now with child and parents data
      var descendants = root.descendants()

      // create whakapapaLinks
      var finalArray = await this.createLinks(descendants)

      // create whakapapa with top ancestor as focus
      this.createView({
        ...this.newView,
        focus: finalArray[0].parent.data.id
      })
    },

    async createProfiles (csv) {
      // csv.forEach(d => {
      //   this.recordQueue = [...this.recordQueue, d]
      //   if (!this.processingQueue) this.processingQueue = true
      // })
      // function sleep (ms) {
      //   return new Promise(resolve => setTimeout(resolve, ms))
      // }
      this.columns = csv.columns
      var items = []

      var currentLen = csv.length
      while (currentLen > 0) {
        let portion = []
        var len = currentLen % 100
        if (len === 0) {
          // take out 500 items
          portion = csv.splice(0, 100)
          currentLen -= 100
        } else {
          // take out n items
          portion = csv.splice(0, len)
          currentLen -= len
        }

        // process the portion
        portion = await Promise.all(portion.map(async d => {
          var id = await this.addPerson(d)

          const person = {
            id: id,
            ...d
          }

          return person
        }))

        // add that portion to an array?

        // await sleep(500)
        items = items.concat(portion)
      }

      console.log(items)
      return items
    },

    async addPerson ($event) {
      // console.log($event)
      let person = {}
      Object.entries($event).map(([key, value]) => {
        if (!isEmpty($event[key])) {
          if (key === 'birthOrder') {
            person[key] = parseInt(value)
          } else if (key === 'deceased' && value === 'yes') {
            person[key] = true
          } else {
            person[key] = value
          }
        }
      })

      try {
        var { id } = $event
        id = await this.createProfile(person)
        if (id.errors) {
          console.error('failed to create profile', id)
          return
        }
        return id
      } catch (err) {
        throw err
      }
    },
    async createLinks (descendants) {
      console.log('createLinks')
      descendants.shift()

      var items = []

      var currentLen = descendants.length
      while (currentLen > 0) {
        let portion = []
        var len = currentLen % 100
        if (len === 0) {
          // take out 500 items
          portion = descendants.splice(0, 100)
          currentLen -= 100
        } else {
          // take out n items
          portion = descendants.splice(0, len)
          currentLen -= len
        }

        portion = await Promise.all(descendants.map(async d => {
          let relationship = {
            child: d.data.id,
            parent: d.parent.data.id,
            relationshipType: d.data.relationshipType
          }
          var link = await this.createChildLink(relationship)

          var person = {
            ...d,
            link: link
          }
          return person
        }))

        items = items.concat(portion)
      }

      console.log('links')
      return items
    },
    async createProfile ({
      preferredName,
      legalName,
      gender,
      bornAt,
      diedAt,
      birthOrder,
      avatarImage,
      altNames,
      description,
      location,
      profession,
      contact,
      deceased
    }) {
      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            type: 'person',
            preferredName,
            legalName,
            gender,
            bornAt,
            diedAt,
            birthOrder,
            avatarImage,
            altNames: {
              add: []
            },
            description,
            location,
            profession,
            contact,
            deceased,
            recps: [this.whoami.feedId] // TODO change this for groups
          }
        }
      })

      if (res.errors) {
        console.error('failed to createProfile', res)
        return
      }
      return res.data.saveProfile // a profileId
    },

    async createChildLink (
      { child, parent, relationshipType, legallyAdopted },
      view
    ) {
      const input = {
        child,
        parent,
        relationshipType,
        legallyAdopted,
        recps: this.newView.recps
      }
      try {
        const res = await this.$apollo.mutate(saveWhakapapaLink(input))
        if (res.errors) {
          console.error('failed to createChildLink', res)
          return
        }
        return res // TODO return the linkId
      } catch (err) {
        console.error(err)
        console.error('child', child)
        console.error('parent', parent)
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
