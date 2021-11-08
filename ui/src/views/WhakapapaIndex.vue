<template>
  <v-container fluid class="px-2">
    <v-row class="pa-5" :class="mobile ? 'pb-0':''" light style="margin-top: 64px;">
      <v-col cols="12" md="10" class="headliner black--text pa-0">
        {{ t('whakapapaTitle')}}
        <v-icon color="blue-grey" light @click="toggleWhakapapaHelper" class="infoButton">mdi-information</v-icon>
      </v-col>
      <!-- Only Kaitiaki can create whakapapa -->
      <v-col v-if="profile.canEdit">
        <BigAddButton :label="t('addWhakapapaButton')" :customClass="mobile ? 'addBtnMobile':'addBtnDesktop'" @click="toggleViewForm" />
      </v-col>
    </v-row>
    <v-row>
      <v-col :class="mobile ? 'pt-0':''" cols="12" md="10">
        <div
          v-if="!whakapapas"
          class="px-8 py-12 subtitle grey--text"
          :class="{
            'text-center': mobile
          }">
          <SkeletonLoader
            :totalSkeletons=1
            skeletonType="list-item-avatar-two-line@20"
          />
        </div>
        <div
          v-else-if="(whakapapas && whakapapas.length < 1) || (whakapapas && whakapapas[0].views.length < 1)"
          class="px-8 py-12 subtitle grey--text"
          :class="{
            'text-center': mobile
          }">
          {{ t('noWhakapapaFound') }}
        </div>
        <div v-else>
          <div v-for="(group, index ) in whakapapas" :key="index" class="py-4">
            <v-row class="pl-6 pb-3">
              <Avatar :size="mobile ? '50px' : '40px'" :image="group.image" :alt="group.name" :isView="!group.image" />
              <p class="black--text overline pl-6 pt-1" style="font-size:20px">{{ `${group.name} ${t('whakapapaRecords')}`}}</p>
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
    <NewViewDialog v-if="showViewForm" :show="showViewForm" :title="t2('createWhakapapa')" @close="toggleViewForm"
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

import WhakapapaViewCard from '@/components/whakapapa/WhakapapaViewCard.vue'
import NewViewDialog from '@/components/dialog/whakapapa/NewViewDialog.vue'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import WhakapapaListHelper from '@/components/dialog/whakapapa/WhakapapaListHelper.vue'
import Avatar from '@/components/Avatar.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

import { saveLink } from '@/lib/link-helpers.js'
import { savePerson } from '@/lib/person-helpers.js'
import { findByName } from '@/lib/search-helpers.js'

import { mapGetters, mapActions, createNamespacedHelpers } from 'vuex'
const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')
const { mapActions: mapTribeActions } = createNamespacedHelpers('tribe')
const { mapActions: mapWhakapapaActions } = createNamespacedHelpers('whakapapa')

export default {
  name: 'WhakapapaIndex',
  props: {
    profile: Object,
    tribe: Object
  },
  components: {
    WhakapapaViewCard,
    NewViewDialog,
    NewNodeDialog,
    WhakapapaListHelper,
    Avatar,
    BigAddButton,
    SkeletonLoader
  },
  data () {
    return {
      suggestions: [],
      views: [],
      showWhakapapaHelper: false,
      showProfileForm: false,
      showViewForm: false,
      newView: null,
      columns: [],
      whakapapas: null
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
    ...mapAlertMutations(['showAlert']),
    ...mapTribeActions(['getTribe']),
    ...mapWhakapapaActions(['getWhakapapaViews', 'saveWhakapapaView']),

    async groupedWhakapapaViews () {
      const views = await this.getWhakapapaViews()

      if (this.$route.params.profileId === this.whoami.personal.profile.id) {
        var groupedObj = groupBy(views, 'recps[0]')

        let filtered = await Promise.all(
          Object.keys(groupedObj).map(async id => {
            var views = groupedObj[id]
            if (id === this.whoami.personal.groupId) return { name: this.t('privateRecords'), image: this.whoami.personal.profile.avatarImage, views: views, tribeId: this.whoami.personal.groupId }
            var tribe = await this.getTribe(id)

            if (tribe.private && tribe.private.length) return { name: tribe.private[0].preferredName, image: tribe.private[0].avatarImage, views: views, tribeId: tribe.id }
            return null
          })
        )

        filtered = filtered.filter(Boolean)

        return filtered
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
      // TODO cherese 6/11/21 get rid of this code
      const pruned = {}
      Object.entries(input).forEach(([key, value]) => {
        if (!isEmpty(value)) pruned[key] = value
      })

      const whakapapaId = await this.saveWhakapapaView(input)

      var type = this.$route.name.split('/whakapapa')[0]

      this.$router.push({
        name: type + '/whakapapa/:whakapapaId',
        params: {
          whakapapaId
        }
      }).catch(() => {})
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
    async buildFromFile (csvRows) {
      this.setLoading(true)

      // create a profile for each row in the csv
      var res = await this.createProfiles(csvRows)
      if (!res) return

      const { profiles, links } = res

      // create all the links from the profiles
      await this.createLinks(links, profiles)

      // get the root persons profileId
      const rootCsvId = csvRows[0].csvId
      const rootProfileId = profiles[rootCsvId]

      // create whakapapa with first person in the csv as the focus
      await this.createView({
        ...this.newView,
        focus: rootProfileId
      })
    },

    async createProfiles (csvData) {
      const profiles = {}
      const links = csvData
        .map(row => row.link)
        .filter(Boolean)

      /*
        NOTE:
        profiles = {
          [csvId]: profileId
        }

        links = [{ childCsvId, parentCsvId, relationshipType }]
      */
      const res = await Promise.all(
        csvData.map(async ({ csvId, profile }) => {
          if (!profile) return

          var profileId = await this.createProfile(profile)
          profiles[csvId] = profileId
        })
      )
        .catch((err) => {
          console.error('failed to create profile with csv bulk create', err)
          this.setLoading(false)
        })

      if (!res) return

      return { profiles, links }
    },
    async createLinks (links, profiles) {
      await Promise.all(
        links.map(link => {
          const { parentCsvId, childCsvId, relationshipType } = link

          const relationship = {
            // get the parent and child's actual profileId
            parent: profiles[parentCsvId],
            child: profiles[childCsvId],
            relationshipType: relationshipType
          }

          return this.createChildLink(relationship)
        })
      )
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
    },
    t (key, vars) {
      return this.$t('whakapapaIndex.' + key, vars)
    },
    t2 (key, vars) {
      return this.$t('addWhakapapaForm.' + key, vars)
    },
    cordovaBackButton () {
      if (this.showViewForm) {
        this.toggleViewForm()
        return false
      }
    }
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
