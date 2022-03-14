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
          v-if="!views"
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
          v-else-if="(views && views.length < 1)"
          class="px-8 py-12 subtitle grey--text"
          :class="{
            'text-center': mobile
          }">
          {{ t('noWhakapapaFound') }}
        </div>
        <div v-else>
          <div v-for="view in views" :key="view.id">
            <v-row dense class="mb-2">
              <v-col cols="12" md="10">
                <WhakapapaViewCard :view="view" cropDescription :tribeId="$route.params.tribeId" />
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- admin only views -->
    <v-row v-if="(adminViews && adminViews.length)">
      <v-col :class="mobile ? 'pt-0':''" cols="12" md="10">
        <v-divider light class="mt-12" style="max-width:80%"></v-divider>
        <v-row class=" pb-3">
          <p class="black--text overline pl-6 pt-1" style="font-size:20px">{{ `${profile.preferredName} -- ${t('adminWhakapapaRecords')}`}}</p>
        </v-row>
        <div v-for="view in adminViews" :key="view.id">
          <v-row dense class="mb-2">
            <v-col cols="12" md="10">
              <WhakapapaViewCard :view="view" cropDescription :tribeId="adminGroupId" />
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <NewViewDialog v-if="showViewForm" :show="showViewForm" :title="t2('createWhakapapa')" @close="toggleViewForm"
      @submit="handleStepOne($event)" />
    <!-- TODO: add suggestions in here as well? -->
    <NewNodeDialog v-if="showProfileForm" :show="showProfileForm" :suggestions="suggestions"
      @getSuggestions="getSuggestions" title="Add a Person" @create="handleDoubleStep"
      :withRelationships="false" @close="close"
    />
    <WhakapapaListHelper v-if="showWhakapapaHelper" :show="showWhakapapaHelper" @close="toggleWhakapapaHelper" />
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import pick from 'lodash.pick'

import WhakapapaViewCard from '@/components/whakapapa/WhakapapaViewCard.vue'
import NewViewDialog from '@/components/dialog/whakapapa/NewViewDialog.vue'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import WhakapapaListHelper from '@/components/dialog/whakapapa/WhakapapaListHelper.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

import { ACCESS_ALL_MEMBERS, ACCESS_KAITIAKI, ACCESS_PRIVATE } from '@/lib/constants.js'

export default {
  name: 'WhakapapaIndex',
  props: {
    profile: Object,
    tribe: Object
  },
  data () {
    return {
      suggestions: [],
      showWhakapapaHelper: false,
      showProfileForm: false,
      showViewForm: false,
      newView: null,
      columns: [],
      adminGroupId: null,

      views: null, // becomes an array when loaded
      adminViews: null
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess']),
    ...mapGetters('tribe', ['tribes']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  async mounted () {
    const groupId = this.$route.params.tribeId

    // set the current default access as the current group
    this.views = await this.getWhakapapaViews({ groupId })

    this.adminGroupId = this.tribe.admin && this.tribe.admin.id
    if (this.adminGroupId) {
      this.adminViews = await this.getWhakapapaViews({ groupId: this.adminGroupId })
    }
  },
  methods: {
    ...mapActions(['setLoading']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('tribe', ['getTribe']),
    ...mapActions('person', ['createPerson', 'findPersonByName']),
    ...mapActions('whakapapa', ['createWhakapapaView', 'getWhakapapaViews', 'bulkCreateWhakapapaView']),
    async getSuggestions (name) {
      if (!name) {
        this.suggestions = []
        return
      }

      const { type, groupId } = this.currentAccess
      let records
      if (type === ACCESS_ALL_MEMBERS) records = await this.findPersonByName({ name, groupId, type: 'person' })
      if (type === ACCESS_KAITIAKI) records = await this.findPersonByName({ name, groupId, type: 'person/admin' })
      if (type === ACCESS_PRIVATE) {
        const source = await this.findPersonByName({ name, groupId, type: 'person/source' })
        const other = await this.findPersonByName({ name, groupId, type: 'person' })
        records = [...source, ...other]
      }

      // sets suggestions which is passed into the dialogs
      this.suggestions = records
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
    async processCreateWhakapapaView (input) {
      const whakapapaId = await this.createWhakapapaView(input)
      if (whakapapaId) this.goToWhakapapaView(whakapapaId)
    },
    goToWhakapapaView (whakapapaId) {
      var type = this.$route.name.split('/whakapapa')[0]

      this.$router.push({
        name: type + '/whakapapa/:whakapapaId',
        params: {
          whakapapaId
        }
      }).catch(() => {})
    },
    async handleStepOne (input) {
      if (this.currentAccess.groupId) input.recps = [this.currentAccess.groupId]
      else throw new Error('Recps field missing from whakapapa input')

      this.newView = {
        ...pick(input, ['name', 'description', 'image', 'recps']),
        focus: null, // To complete
        // change this fo profile in the current group
        mode: 'descendants' // hard-coded at the moment
      }

      if (input.focus === 'self') {
        const profileId = this.whoami.private
        this.newView.focus = profileId
      }

      switch (input.focus) {
        case 'self':
          return this.processCreateWhakapapaView(this.newView)
        case 'new':
          return this.toggleProfileForm()
        case 'file':
          return this.processCreateFromCsv(input.csv)
        default:
          this.setLoading(false)
          console.error('Something went wrong while creating a new whakapapa', input)
      }
    },
    async handleDoubleStep (input) {
      try {
        var { id } = input

        // if theres no id, that means we're creating the whakapapa from a new person
        if (!id) {
          input.type = this.currentAccess.type === ACCESS_KAITIAKI ? 'person/admin' : 'person'
          input.authors = {
            add: [
              input.recps.includes(this.whoami.personal.groupId)
                ? this.whoami.public.feedId
                : '*'
            ]
          }

          id = await this.createPerson(input)
        }

        await this.processCreateWhakapapaView({ ...this.newView, focus: id })
      } catch (err) {
        this.setLoading(false)
        console.error('Something went wrong while creating a whakapapa from a person', err)
      }
    },
    async processCreateFromCsv (rows) {
      const whakapapaId = await this.bulkCreateWhakapapaView({ whakapapaViewInput: this.newView, rows })
      this.goToWhakapapaView(whakapapaId)
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
  },
  components: {
    WhakapapaViewCard,
    NewViewDialog,
    NewNodeDialog,
    WhakapapaListHelper,
    BigAddButton,
    SkeletonLoader
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
