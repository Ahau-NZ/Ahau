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
          <CollectionGroup v-if="mobile" :collections="views" @click="goWhakapapaShow"/>
          <div v-else>
            <div v-for="view in views" :key="view.id">
              <v-row dense class="mb-2">
                <v-col cols="12" md="10">
                  <WhakapapaViewCard :view="view" cropDescription :tribeId="$route.params.tribeId" />
                </v-col>
              </v-row>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- admin only views -->
    <v-row v-if="(adminViews && adminViews.length)">
      <v-col :class="mobile ? 'pt-0':''" cols="12" md="10">
        <v-divider light class="mt-12" style="max-width:80%"></v-divider>
        <v-row class=" pb-3">
          <p class="black--text overline pl-6 pt-1" style="font-size:20px">{{ t('adminWhakapapaRecords') }}</p>
        </v-row>
        <CollectionGroup v-if="mobile" :collections="adminViews" @click="goWhakapapaShow"/>
        <div v-else>
          <div v-for="view in adminViews" :key="view.id">
            <v-row dense class="mb-2">
              <v-col cols="12" md="10">
                <WhakapapaViewCard :view="view" cropDescription :tribeId="adminGroupId" />
              </v-col>
            </v-row>
          </div>
        </div>
      </v-col>
    </v-row>

    <NewViewDialog v-if="showViewForm"
      :show="showViewForm"
      :title="t2('createWhakapapa')"

      @close="toggleViewForm"
      @submit="handleStepOne"
    />

    <NewPersonDialog v-if="showProfileForm"
      :show="showProfileForm"
      title="Add a Person"

      @create="handleDoubleStep"
      @close="close"
    />
    <WhakapapaListHelper v-if="showWhakapapaHelper" :show="showWhakapapaHelper" @close="toggleWhakapapaHelper" />
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { isEmpty, pick } from 'lodash-es'

import WhakapapaViewCard from '@/components/whakapapa/WhakapapaViewCard.vue'
import NewViewDialog from '@/components/dialog/whakapapa/NewViewDialog.vue'
import NewPersonDialog from '@/components/dialog/profile/NewPersonDialog.vue'
import WhakapapaListHelper from '@/components/dialog/whakapapa/WhakapapaListHelper.vue'
import BigAddButton from '@/components/button/BigAddButton.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

import { ACCESS_KAITIAKI } from '@/lib/constants'
import CollectionGroup from '../components/archive/CollectionGroup.vue'
import { getInitialCustomFieldChanges } from '@/lib/custom-field-helpers'

export default {
  name: 'WhakapapaIndex',
  props: {
    profile: Object
  },
  components: {
    WhakapapaViewCard,
    NewViewDialog,
    NewPersonDialog,
    WhakapapaListHelper,
    BigAddButton,
    SkeletonLoader,
    CollectionGroup
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
    ...mapGetters('tribe', ['currentTribe', 'tribes', 'isPersonalTribe', 'tribeCustomFields']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  watch: {
    currentTribe: {
      immediate: true,
      deep: true,
      async handler (tribe) {
        if (!tribe) return

        const views = await this.getWhakapapaViews({ groupId: tribe.id })
        this.views = views.map(view => {
          if (!view.permission) view.permission = 'edit'
          return view
        })

        if (this.isPersonalTribe) return

        if (tribe.admin) {
          this.adminGroupId = tribe.admin.id
          this.adminViews = await this.getWhakapapaViews({ groupId: this.adminGroupId })
        }
      }
    }
  },
  methods: {
    ...mapActions(['setLoading']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('person', ['createPerson', 'findPersonByName']),
    ...mapActions('whakapapa', ['createWhakapapaView', 'getWhakapapaViews', 'bulkCreateWhakapapaView']),
    ...mapActions('community', ['updateCommunityFieldDefs']),
    ...mapActions('tribe', ['loadTribe']),
    goWhakapapaShow (view) {
      this.$router.push({
        name: this.$route.name + '/:whakapapaId',
        params: {
          tribeId: view.recps[0],
          whakapapaId: view.id
        }
      })
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
      const type = this.$route.name.split('/whakapapa')[0]

      this.$router.push({
        name: type + '/whakapapa/:whakapapaId',
        params: {
          whakapapaId
        }
      }).catch(() => {})
    },
    async handleStepOne ({ customFieldDefs, csvRows, whakapapaInput }) {
      if (this.currentAccess.groupId) whakapapaInput.recps = [this.currentAccess.groupId]
      else throw new Error('Recps field missing from whakapapa input')

      // check for custom fields and create any that are needed
      if (customFieldDefs) {
        await this.updateCommunityFieldDefs(customFieldDefs)
        // reload the tribe
        await this.loadTribe(this.currentTribe.id)
      }

      this.newView = {
        ...pick(whakapapaInput, ['name', 'description', 'image', 'recps', 'permission']),
        focus: null, // To complete
        // change this fo profile in the current group
        mode: 'descendants' // hard-coded at the moment
      }

      if (whakapapaInput.focus === 'self') {
        const profileId = this.whoami.private
        this.newView.focus = profileId
      }

      switch (whakapapaInput.focus) {
        case 'self':
          return this.processCreateWhakapapaView(this.newView)
        case 'new':
          return this.toggleProfileForm()
        case 'file':
          return this.processCreateFromCsv(csvRows)
        default:
          this.setLoading(false)
          console.error('Something went wrong while creating a new whakapapa', whakapapaInput)
      }
    },
    async handleDoubleStep (input) {
      try {
        let {
          id
        } = input

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

          // format custom fields
          if (input.customFields) {
            input.customFields = getInitialCustomFieldChanges(input.customFields[this.currentTribe.id], this.tribeCustomFields)
            if (isEmpty(input.customFields)) delete input.customFields
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
      if (whakapapaId) this.goToWhakapapaView(whakapapaId)
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
