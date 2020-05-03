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

// import clone from 'lodash.clonedeep'
// import _ from 'lodash'

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
      columns: []
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
      console.log('buildingFromFile: ', csv.length)
      this.setLoading(true)
      var startTime = Date.now()
      // create profile for each person

      var profilesArray = await this.createProfiles(csv)

      profilesArray['columns'] = this.columns
      console.log('------Create profiles finsihed-------: ', profilesArray.length)

      // create obj of children and parents
      var root = await d3.stratify()
        .id(function (d) { return d.number })
        .parentId(function (d) { return d.parentNumber })(profilesArray)
      console.log('----Assign parent numbers finsihed------')

      // create new array now with child and parents data
      var descendants = await root.descendants()
      console.log('----Build Descendants object finsihed------')

      // create whakapapaLinks
      var finalArray = await this.createLinks(descendants)

      console.log('-----Create childlinks finished------: ', finalArray)

      var endTime = Date.now()
      var eclipsedTime = (endTime - startTime) / 1000
      console.log('csv build time: ', eclipsedTime)

      // create whakapapa with top ancestor as focus
      this.createView({
        ...this.newView,
        focus: root.data.id
      })
    },

    async createProfiles (csv) {
      this.columns = csv.columns
      console.log('creating profiles', csv.length)

      // ---------------SPLIT INTO CHUNKS OF 100 : 468 nodes 28sec--------------------
      // var chunks = await _.chunk(csv, 100)
      // var profiles = []

      // while (chunks.length > 0) {
      //   var chunk = chunks.shift()
      //   console.log('starting chunk: ', chunk.length)

      //   var profileChunk = await Promise.all(chunk.map(async d => {
      //     console.log('mapping person')
      //     var id = await this.addPerson(d)

      //     const person = {
      //       id: id,
      //       ...d
      //     }
      //     return person
      //   }))
      //   console.log('chunk completed: ', profileChunk.length)
      //   profiles.push(profileChunk)
      // }
      // var merged = await [].concat.apply([], profiles)
      // console.log('profiles', merged)
      // return merged

      // ----------PROMISE AND MAPS : 458 NODES, 26sec : LIMIT to 1000 nodes
      // create a profile for each person and add the created id to the person and parse back to profilesArray
      return Promise.all(csv.map(async d => {
        var id = await this.addPerson(d)
        const person = {
          id: id,
          ...d
        }
        return person
      })
      )

      // ---------------SPLIT ONE BY ONE : 468 nodes 157sec--------------------
      // var array = clone(csv)
      // var profiles = []

      // while (array.length > 0) {
      //   const person = array.shift()
      //   var id = await this.addPerson(person)
      //   const profile = {
      //     id: id,
      //     ...person
      //   }
      //   profiles.push(profile)
      // }
      // console.log('profiles', profiles)
      // return profiles
    },

    async addPerson ($event) {
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
      // console.log('person: ', person)
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
      console.log('adding links: ', descendants.length)

      // ---------------SPLIT INTO CHUNKS OF 100 : 468 nodes 28sec--------------------
      // var array = clone(descendants)
      // array.shift()
      // var chunks = _.chunk(array, 100)
      // var links = []

      // while (chunks.length > 0) {
      //   var chunk = chunks.shift()
      //   console.log('starting link chunk: ', chunk.length)

      //   var linkChunk = await Promise.all(chunk.map(async d => {
      //     console.log('mapping links')
      //     let relationship = {
      //       child: d.data.id,
      //       parent: d.parent.data.id,
      //       relationshipType: d.data.relationshipType
      //     }

      //     var link = await this.createChildLink(relationship)

      //     var person = {
      //       ...d,
      //       link: link
      //     }
      //     return person
      //   }))
      //   console.log('link chunk completed', linkChunk.length)
      //   links.push(linkChunk)
      // }
      // var merged = [].concat.apply([], links)
      // console.log('Links', merged)
      // return merged

      // -------- SPLIT ONE BY ONE : NO LIMIT : 128sec-----------

      // var array = clone(descendants)
      // array.shift()
      // var links = []
      // while (array.length > 0) {
      //   const d = array.shift()
      //   let relationship = {
      //     child: d.data.id,
      //     parent: d.parent.data.id,
      //     relationshipType: d.data.relationshipType
      //   }
      //   var link = await this.createChildLink(relationship)
      //   var person = {
      //     ...d,
      //     link: link
      //   }
      //   links.push(person)
      // }
      // console.log('links', links)
      // return links

      // --------- PROMISE MAP : LIMIT : 25sec ------------

      descendants.shift()

      return Promise.all(descendants.map(async d => {
        let relationship = {
          child: d.data.id,
          parent: d.parent.data.id,
          relationshipType: d.data.relationshipType
        }
        console.log('realtionship: ', relationship)

        var link = await this.createChildLink(relationship)

        var person = {
          ...d,
          link: link
        }
        return person
      }))
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
      } else {
        console.log('Profile made')
        return res.data.saveProfile // a profileId
      }
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
        } else {
          console.log('Link made')
          return res.data.saveWhakapapaLink // TODO return the linkId
        }
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
