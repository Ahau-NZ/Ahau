
<template>
  <v-container fluid class="px-2">
    <v-row class="pa-5" :class="mobile ? 'pb-0':''" light style="margin-top: 64px;">
      <v-col cols="12" md="10" class="headliner black--text pa-0">
        Whakapapa records
        <v-icon color="blue-grey" light @click="toggleWhakapapaHelper" class="infoButton">mdi-information</v-icon>
      </v-col>
      <v-col>
        <BigAddButton label="new whakapapa record" :customClass="mobile ? 'addBtnMobile':'addBtnDesktop'" @click="toggleViewForm" />
      </v-col>
    </v-row>
    <v-row>
      <v-col :class="mobile ? 'pt-0':''" cols="12" md="10">
        <div v-if="!whakapapas || (whakapapas && whakapapas.length < 1) || (whakapapas && whakapapas[0].views.length < 1) " class="px-8 py-12 subtitle grey--text " :class="{
            'text-center': mobile
          }">
          No whakapapa record found
        </div>
        <div v-else>
          <div v-for="(group, index ) in whakapapas" :key="index" class="py-4">
            <v-row class="pl-6 pb-3">
              <Avatar :size="mobile ? '50px' : '40px'" :image="group.image" :alt="group.name" :isView="!group.image" />
              <p class="black--text overline pl-6 pt-1" style="font-size:20px">{{ group.name }} records</p>
            </v-row>
            <v-row v-for="view in group.views" :key="view.id" dense class="mb-2">
              <v-col cols="12" md="10">
                <WhakapapaViewCard :view="view" cropDescription :tribeId="group.tribeId" />
              </v-col>
            </v-row>
            <v-divider light class="mt-12" style="max-width:80%"></v-divider>
          </div>
        </div>
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
</template>

<script>
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'
import groupBy from 'lodash.groupby'

import * as d3 from 'd3'
import { mapGetters, mapActions } from 'vuex'
import WhakapapaViewCard from '@/components/whakapapa/WhakapapaViewCard.vue'
import NewViewDialog from '@/components/dialog/whakapapa/NewViewDialog.vue'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import WhakapapaListHelper from '@/components/dialog/whakapapa/WhakapapaListHelper.vue'
import Avatar from '@/components/Avatar.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'

import { saveLink } from '@/lib/link-helpers.js'
import { savePerson } from '@/lib/person-helpers.js'
import { saveWhakapapaView, getWhakapapaViews } from '@/lib/whakapapa-helpers.js'
import { findByName } from '@/lib/search-helpers.js'
import mapProfileMixins from '@/mixins/profile-mixins.js'

export default {
  name: 'WhakapapaIndex',
  props: {
    profile: Object,
    tribe: Object
  },
  mixins: [
    mapProfileMixins({
      mapMethods: ['getTribe']
    })
  ],
  data () {
    return {
      suggestions: [],
      views: [],
      showWhakapapaHelper: false,
      showProfileForm: false,
      showViewForm: false,
      newView: null,
      columns: [],
      whakapapas: []
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  async mounted () {
    // set the current default access as the current group
    this.whakapapas = await this.groupedWhakapapaViews()
  },
  methods: {
    ...mapActions(['setLoading']),

    async groupedWhakapapaViews () {
      var views = []
      const res = await this.$apollo.query(getWhakapapaViews())
      if (res.errors) {
        console.log('error getting whakapapa views')
      } else {
        views = res.data.whakapapaViews
      }
      if (this.$route.params.profileId === this.whoami.personal.profile.id) {
        var groupedObj = groupBy(views, 'recps[0]')
        const groups = await Promise.all(
          Object.keys(groupedObj).map(async id => {
            var views = groupedObj[id]
            if (id === this.whoami.personal.groupId) return { name: 'my private', image: this.whoami.personal.profile.avatarImage, views: views, tribeId: this.whoami.personal.groupId }
            var tribe = await this.getTribe(id)
            return { name: tribe.private[0].preferredName, image: tribe.private[0].avatarImage, views: views, tribeId: tribe.id }
          })
        )
        const filteredGroups = groups.filter(i => !isEmpty(i))
        return filteredGroups
      }

      return [{
        name: this.profile.preferredName,
        views: views.filter(view => {
          return view.recps.some(recp => {
            return recp === this.$route.params.tribeId
          })
        }),
        image: this.profile.avatarImage,
        tribeId: this.$route.params.tribeId
      }]
    },

    async getSuggestions ($event) {
      if (!$event) {
        this.suggestions = []
        return
      }

      var records = await findByName($event)

      var profiles = {} // flatStore for these suggestions

      // filter out all records that arent in the current tribe
      records = records
        .filter(profile => {
          var equals = isEqual(profile.recps, [this.currentAccess.groupId])
          if (equals) profiles[profile.id] = profile
          return equals
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
        const result = await this.$apollo.mutate(
          saveWhakapapaView(input)
        )

        if (result.errors) throw result.errors

        var type = this.$route.name.split('/whakapapa')[0]
        this.$router.push({
          name: type + '/whakapapa/:whakapapaId',
          params: {
            whakapapaId: result.data.saveWhakapapaView
          }
        }).catch(() => {})
      } catch (err) {
        this.setLoading(false)
        console.error('Something went wrong while creating a whakapapa', err)
      }
    },
    async handleDoubleStep (input) {
      try {
        var { id } = input

        if (!id) {
          input.type = 'person'
          input.authors = {
            add: [
              input.recps.includes(this.whoami.personal.groupId)
                ? this.whoami.public.feedId
                : '*'
            ]
          }
          const res = await this.$apollo.mutate(
            savePerson(input)
          )

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
      if (input.avatarImage) delete input.avatarImage.uri
      if (input.headerImage) delete input.headerImage.uri

      const res = await this.$apollo.mutate(savePerson({
        type: 'person',
        recps: [this.currentAccess.groupId],
        authors: {
          add: ['*']
        },
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
    WhakapapaListHelper,
    Avatar,
    BigAddButton
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .headliner {
    font-size: 1em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 5px;
  }

  .infoButton {
    margin-left: 10px;
  }

</style>
