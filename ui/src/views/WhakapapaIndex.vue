<template>
  <div :class="showProfileView ? 'flexStart': 'flexCenter'">
    <v-container fluid class="white body-width mx-0 px-0" :style="!mobile ? 'margin-top: 64px;' : 'margin-top: 64px;' ">

       <!-- Header  -->
      <v-row class="pa-5" light>
        <v-col cols="12" class="headliner black--text pa-0">
          Whakapapa records
          <v-icon color="blue-grey" light @click="toggleWhakapapaHelper" class="infoButton">mdi-information</v-icon>
        </v-col>

        <v-btn
          @click="toggleViewForm"
          :medium="!mobile"
          :class="!mobile ? 'addBtn my-2' : 'addBtnMobile'"
          :color="!mobile ? 'white' : 'rgba(160, 35, 36,1)'"
          elevation="2"
          fab
          light
          :fixed="mobile"
          :bottom="mobile"
          :right="mobile"
        >
          <v-icon :large="!mobile" :class="!mobile ? 'black--text' : 'white--text'">mdi-plus</v-icon>
        </v-btn>

      </v-row>

      <div v-if="!filteredWhakapapaViews || (filteredWhakapapaViews && filteredWhakapapaViews.length < 1)" class="px-8 py-12 subtitle grey--text " :class="{
          'text-center': mobile
        }">
        No whakapapa record found
      </div>

      <v-row v-for="view in filteredWhakapapaViews" :key="view.id" dense class="mb-2">
        <v-col cols="12" md="10">
          <WhakapapaViewCard :view="view" cropDescription />
        </v-col>
      </v-row>

      <NewViewDialog v-if="showViewForm" :show="showViewForm" title="Create a new whakapapa" @close="toggleViewForm"
        @submit="handleStepOne($event)" />
      <!-- TODO: add suggestions in here as well? -->
      <NewNodeDialog v-if="showProfileForm" :show="showProfileForm" :suggestions="suggestions"
        @getSuggestions="getSuggestions" title="Add a Person" @create="handleDoubleStep($event)"
        :withRelationships="false" @close="close"
      />

      <WhakapapaListHelper v-if="showWhakapapaHelper" :show="showWhakapapaHelper" @close="toggleWhakapapaHelper" />

    </v-container>
  </div>

</template>

<script>
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'

import * as d3 from 'd3'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import WhakapapaViewCard from '@/components/whakapapa/WhakapapaViewCard.vue'
import NewViewDialog from '@/components/dialog/whakapapa/NewViewDialog.vue'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import WhakapapaListHelper from '@/components/dialog/whakapapa/WhakapapaListHelper.vue'

import { saveLink } from '@/lib/link-helpers.js'
import { savePerson } from '@/lib/person-helpers.js'
import tree from '@/lib/tree-helpers'
import { saveWhakapapaView, getWhakapapaViews } from '@/lib/whakapapa-helpers.js'
import { findByName } from '@/lib/search-helpers.js'

export default {
  name: 'WhakapapaIndex',
  data () {
    return {
      suggestions: [],
      items: [{
        src: require('../assets/tree.jpg')
      },
      {
        src: require('../assets/whakapapa-list.jpg')
      }
      ],
      views: [],
      showWhakapapaHelper: false,
      showProfileForm: false,
      showViewForm: false,
      newView: null,
      columns: [],
      profileWhakapapaView: {
        type: Boolean,
        default: false
      },
      showProfileView: false
    }
  },
  created () {
    if (this.$route.name === 'profileShow') {
      this.showProfileView = true
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess', 'getDefaultAccess', 'currentProfile', 'currentTribe']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    filteredWhakapapaViews () {
      if (this.currentProfile.type === 'person') {
        return this.views
      }

      return this.views.filter(view => {
        return view.recps.some(recp => {
          return recp === this.currentTribe.id
        })
      })
    }
  },
  mounted () {
    // set the current default access as the current group
    this.setCurrentAccess(this.getDefaultAccess)
  },
  apollo: {
    views: getWhakapapaViews()
  },
  methods: {
    ...mapMutations(['setCurrentAccess']),
    ...mapActions(['addNestedWhakapapa', 'setLoading']),
    async getSuggestions ($event) {
      if (!$event) {
        this.suggestions = []
        return
      }

      var records = await findByName($event)

      if (isEmpty(records)) {
        this.suggestions = []
        return
      }

      var profiles = {} // flatStore for these suggestions

      // filter out all records that arent in the current tribe
      records = records.filter(record => {
        return isEqual(record.recps, [this.currentAccess.groupId])
      })

      records.forEach(record => {
        profiles[record.id] = record // add this record to the flatStore
      })

      records = records.map(record => {
        let obj = {}
        let profile = record
        obj = {
          profile
        }
        return obj
      })

      // hydrate all the left over records
      records = records.map(record => {
        return tree.hydrate(record, profiles) // needed to hydrate to fix all dates
      })

      // sets suggestions which is passed into the dialogs
      this.suggestions = Object.assign([], records)
    },
    toggleWhakapapaHelper () {
      this.showWhakapapaHelper = !this.showWhakapapaHelper
    },
    toggleProfileForm () {
      this.showProfileForm = !this.showProfileForm
    },
    close () {
      this.setLoading(false)
      this.toggleProfileForm()
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
    async handleStepOne (input) {
      var { access } = input

      if (access && access.groupId) input.recps = [access.groupId]
      else throw new Error('Recps field missing from whakapapa input')

      this.newView = {
        ...pick(input, ['name', 'description', 'image', 'recps']),
        focus: this.whoami.personal.profile.id,
        mode: 'descendants' // HARD coded at the moment
      }

      switch (input.focus) {
        case 'self':
          return this.createView(this.newView)
        case 'new':
          return this.toggleProfileForm()
        case 'file':
          return this.buildFromFile(input.csv)
        default:
          this.setLoading(false)
          console.error('Something went wrong while creating a new whakapapa', input)
      }
    },
    async createView (input) {
      const pruned = {}
      Object.entries(input).forEach(([key, value]) => {
        if (!isEmpty(value)) pruned[key] = value
      })

      try {
        const result = await this.$apollo.mutate(saveWhakapapaView(input))

        if (result.errors) throw result.errors

        this.$router.push({
          name: 'whakapapaShow',
          params: {
            id: result.data.saveWhakapapaView
          }
        })
      } catch (err) {
        this.setLoading(false)
        console.error('Something went wrong while creating a whakapapa', err)
      }
    },
    async handleDoubleStep (input) {
      try {
        var { id } = input

        if (!id) {
          const res = await this.$apollo.mutate(savePerson(input))
          if (res.errors) throw res.errors

          id = res.data.saveProfile
        }

        this.createView({ ...this.newView, focus: id })
      } catch (err) {
        this.setLoading(false)
        console.error('Something went wrong while creating a person', err)
      }
    },
    async buildFromFile (csv) {
      this.setLoading(true)

      // create profile for each person
      var profilesArray = await this.createProfiles(csv)

      profilesArray['columns'] = this.columns

      // create obj of children and parents
      var root = await d3.stratify()
        .id(function (d) {
          return d.number
        })
        .parentId(function (d) {
          return d.parentNumber
        })(profilesArray)

      // create new array now with child and parents data
      var descendants = await root.descendants()

      // create whakapapaLinks
      var finalArray = await this.createLinks(descendants)

      // create whakapapa with top ancestor as focus
      this.createView({
        ...this.newView,
        focus: finalArray[0].parent.data.id
      })
    },

    async createProfiles (csv) {
      this.columns = csv.columns

      var results = Promise.all(csv.map(async (d) => {
        var id = await this.createProfile(d)
        return { id, ...d }
      }))
        .then((res) => res)
        .catch((err) => {
          console.error('failed to create profile with csv bulk create', err)
          this.setLoading(false)
        })

      return results
    },
    async createLinks (descendants) {
      // Remove first item
      descendants.shift()

      const results = Promise.all(descendants.map(async (d) => {
        let relationship = { child: d.data.id, parent: d.parent.data.id, relationshipType: d.data.relationshipType }
        var link = await this.createChildLink(relationship)

        var person = {
          ...d,
          link: link
        }

        return person
      }))

      return results
    },

    async createProfile (input) {
      const res = await this.$apollo.mutate(savePerson({
        type: 'person',
        recps: [this.whoami.personal.groupId], // TEMP - safety till we figure out actual recps
        ...input
      }))

      if (res.errors) {
        console.error('failed to createProfile', res.errors)
      } else {
        return res.data.saveProfile // a profileId
      }
    },

    async createChildLink ({
      child,
      parent,
      relationshipType,
      legallyAdopted
    },
    view
    ) {
      const input = {
        type: 'link/profile-profile/child',
        child,
        parent,
        relationshipType,
        legallyAdopted,
        recps: this.newView.recps
      }
      try {
        const res = await this.$apollo.mutate(saveLink(input))
        if (res.errors) {
          console.error('failed to createChildLink', res)
          return
        } else {
          return res.data.saveLink // TODO return the linkId
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
    width: 80%;
  }

  .mobileContainer {
    padding: 0px;
  }

  .top-margin {
    margin-top: 80px;
  }

  .profileWhakapapaView {
    margin-left: 0 !important
  }

  .positionRight {
    position: absolute;
    top: 64px;
    right: 50px;
  }

  .addBtn {
    position: fixed;
    top: 80px;
    right:100px
  }

  .addBtnMobile {
    bottom: 16px !important;
  }

  .infoButton {
    margin-left: 10px;
  }

  .flexStart {
    display: flex;
    justify-content: flex-start;
  }

  .flexCenter {
    display:flex;
    justify-content: center;
  }
</style>
