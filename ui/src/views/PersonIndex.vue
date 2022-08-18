<template>
  <v-container v-if="isKaitiaki" fluid class="px-2 pt-8 peoples-list" style="margin-top: 64px;max-height:80vh;">
    <v-row class="d-flex justify-end" align-items="right" no-gutters>
      <v-col cols="12" md="auto" class="headliner black--text pl-2" :class="mobile && 'mb-6'">
        {{ t('title')}}
      </v-col>
      <v-spacer v-if="!mobile" />
      <v-col class="d-flex justify-end d-inline">
        <v-text-field
          light
          append-icon="mdi-magnify"
          :label="t('action.search')"
          single-line
          hide-details
          outlined
          rounded
          dense
          :style="{ 'max-width': '20rem' }"
          ref="search"
          @input="handleSearchInput"
        />
        <v-icon color="blue-grey" class="px-3" @click="toggleSettings">mdi-cog</v-icon>
      </v-col>
    </v-row>
    <v-row :class="mobile && 'pt-6'">
      <v-col>
        <v-data-table
          :headers="activeHeaders"
          fixed-header
          height="calc(100vh - 255px)"
          :items="filteredProfiles"
          item-key="id"
          :items-per-page="15"
          :loading="isLoading"
          :loading-text="t('loading')"
          :search="search"
          :customFilter="searchFilter"
          :footer-props="{
            itemsPerPageOptions: [15, 50, 100, -1],
            }"
          light

          @click:row="handleShow"
        >
          <template v-if="hiddenColumns" v-slot:header.actions> <!-- eslint-disable-line -->
            <v-icon>mdi-eye-off</v-icon> {{ hiddenColumns }}
          </template>
          <!-- Handle profile image -->
          <template v-slot:item.image="{ item }" > <!-- eslint-disable-line -->
            <Avatar class="" size="35px" :image="item.avatarImage" :isView="false"  :gender="item.gender" :aliveInterval="item.aliveInterval" :deceased="item.deceased"/>
          </template>
          <!-- Handle max description charachters -->
          <template v-slot:item.description="{ item }" > <!-- eslint-disable-line -->
            <span class="description">{{item.description}}</span>
          </template>
          <!-- Handle table actions -->
          <template v-slot:item.actions="{ item }"> <!-- eslint-disable-line -->
            <v-icon small class="mr-2" @click="handleEdit(item)" >
              mdi-pencil
            </v-icon>
            <v-icon small class="mx-2" @click.stop="showDeleteConfirmation(item)" >
              mdi-delete
            </v-icon>
          </template>

          <template v-slot:footer>
            <div :style="{
              position: 'relative',
              bottom: mobile ? '' : '-48px'
            }"
              :class="mobile && 'py-5 justify-center'"
            >
              <v-btn :block="mobile" class="my-2 mx-md-2" small rounded outlined color="#383838"  elevation="0"  @click="showImportDialog = true">
                <v-icon>mdi-file-upload</v-icon>
                <span class="pl-2">upload csv</span>
              </v-btn>
              <v-btn small :block="mobile" class="my-2 mx-md-2" rounded outlined color="#2f4f4f" elevation="0" @click="downloadCsv">
                <v-icon>mdi-file-download</v-icon>
                <span class="pl-2">download csv</span>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <SideNodeDialog v-if="showEditor && selectedProfileId"
      :show="showEditor"
      :profileId="selectedProfileId"

      deleteable
      :editing="isEditing"
      fullForm

      @close="close"
      @cancel="close"
      @delete="showDeleteConfirmation"
      @saved="handleSaved"
    />

    <RemovePersonDialog v-if="showDelete && selectedProfileId && selectedProfile"
      :show="showDelete"
      context="personIndex"

      :profile="selectedProfile"

      @submit="handleDelete"
      @close="showDelete = false"
    />
    <ImportPeopleDialog v-if="showImportDialog"
      :show="showImportDialog"
      @submit="importCsv"
      @close="showImportDialog = false"
    />
    <FilterMenu
      :isList="true"
      :show="settingsPanel"
      :activeHeaders="activeHeaders"
      :headers.sync="headers"
      @close="toggleSettings()"
      @toggleAvatars="toggleShowAvatars()"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import debounce from 'lodash.debounce'
import isEmpty from 'lodash.isempty'
import { mergeAdminProfile } from '@/lib/person-helpers.js'
import { dateIntervalToString } from '@/lib/date-helpers.js'
import calculateAge from '@/lib/calculate-age'
import { csvFormat } from 'd3'
import { mapNodeToCsvRow } from '@/lib/csv.js'
import { determineFilter } from '@/lib/filters.js'

import SideNodeDialog from '@/components/dialog/profile/SideNodeDialog.vue'
import RemovePersonDialog from '@/components/dialog/profile/RemovePersonDialog.vue'
import ImportPeopleDialog from '@/components/dialog/ImportPeopleDialog.vue'
import FilterMenu from '@/components/dialog/whakapapa/FilterMenu.vue'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'PersonIndex',
  components: {
    SideNodeDialog,
    RemovePersonDialog,
    ImportPeopleDialog,
    FilterMenu,
    Avatar
  },
  data () {
    const header = (key, width, show, disableSort) => {
      return {
        value: key,
        text: this.t('prop.' + key),
        align: 'center',
        width: width || 'auto',
        show: show,
        sortable: !disableSort
      }
    }
    return {
      headers: [
        header('image', '80px', true, true),
        header('preferredName', '120px', true),
        header('legalName', '150px', true),
        header('altNames', '150px', true),
        header('gender', '100px', true),
        header('description', '200px', false),
        header('age', '80px', true),
        header('dob', '150px', true),
        header('dod', '150px', false),

        header('phone', '100px', true), //   admin
        header('email', '100px', true), //   admin
        header('address', '200px', true), // admin
        header('city', '100px', true),
        header('country', '100px', true),
        header('postCode', '100px', true, true),

        header('placeOfBirth', '100px', false),
        header('birthOrder', '100px', false),
        header('placeOfDeath', '100px', false),
        header('buriedLocation', '100px', false),
        header('profession', '100px', true),
        header('education', '150px', true),
        header('school', '150px', true)
      ],
      isLoading: false,
      profilesIndex: [],
      showEditor: false,
      isEditing: false,
      showDelete: false,
      search: '',
      showImportDialog: false,
      settingsPanel: false
    }
  },
  async mounted () {
    if (!this.isKaitiaki) return
    // NOTE this is a crude protection against a person changing tribe selection
    // and then magically being able to load this list
    await this.loadData()

    // populate headers with custom fields
    this.headers.push(...this.customFieldHeaders)
  },
  watch: {
    async isKaitiaki (isKaitiaki) {
      if (isKaitiaki) await this.loadData()
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess', 'isKaitiaki']),
    ...mapGetters('person', ['person', 'selectedProfileId', 'profilesArr']),
    ...mapGetters('tribe', ['tribes', 'tribeCustomFields']),
    ...mapGetters('table', ['tableFilter']),
    activeHeaders () {
      return [
        ...this.headers
          // TODO: these need to be filtered out if the default headers have been tombstoned
          .filter(h => h.show), // default headers

        // ensure these actions are always the last
        { value: 'actions', align: 'end', width: '100px', show: true, sortable: false }
      ]
    },
    customFieldHeaders () {
      return this.tribeCustomFields.map(field => {
        return {
          align: 'center',
          show: true,
          sortable: true,
          text: field.label,
          value: `customFields.${field.key}`,
          width: '100px'
        }
      })
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    selectedProfile () {
      if (!this.selectedProfileId) return null

      return this.person(this.selectedProfileId)
    },
    filteredProfiles () {
      return this.profilesIndex.filter(d => determineFilter({ data: d }, this.tableFilter))
    },
    hiddenColumns () {
      return this.headers.length - this.activeHeaders.length
    }
  },
  methods: {
    ...mapActions('person', ['loadPersonList', 'setSelectedProfileId', 'deletePerson']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('whakapapa', ['bulkCreateWhakapapaView']),
    ...mapActions(['setLoading']),
    toggleSettings () {
      this.settingsPanel = !this.settingsPanel
    },
    async importCsv (csv) {
      this.showImportDialog = false
      const whakapapaViewInput = { recps: [this.currentAccess.groupId] }
      // We set whakapapaViewInput so we can reuse bulkCreateWhakapapaView function for importing profiles and links (if there are links).
      // We add type: 'people' to ignore creating the whakapapa in the end
      const importedProfiles = await this.bulkCreateWhakapapaView({ whakapapaViewInput, rows: csv, type: 'people' })
      if (csv.length === Object.keys(importedProfiles).length) {
        this.setLoading(false)
        await this.loadData()
      }
    },
    t (key) {
      return this.$t('personIndex.' + key)
    },
    async loadData () {
      this.isLoading = true
      const { tribeId } = this.$route.params

      await this.loadPersonList({ type: 'group', tribeId })

      this.profilesIndex = this.profilesArr.map(this.mapProfileData)

      this.isLoading = false
    },
    mapProfileData (profile) {
      if (profile.aliveInterval) {
        profile.dob = this.computeDate('dob', profile.aliveInterval)
        profile.dod = this.computeDate('dod', profile.aliveInterval)
        profile.age = this.age(profile.aliveInterval)
      }

      if (profile.customFields && Array.isArray(profile.customFields)) {
        profile.customFields = profile.customFields
          .reduce((acc, field) => {
            return { ...acc, [field.key]: field.value }
          }, {})
      }

      return profile
    },
    searchFilter (value, search, item) {
      const _search = search.toLocaleLowerCase()
      return Object.values(item).some(value => {
        if (value == null) return false
        if (Array.isArray(value)) {
          return value.some(v => v.toString().toLocaleLowerCase().includes(_search))
        }
        return value.toString().toLocaleLowerCase().includes(_search)
      })
    },
    // modified from vuetify :
    // function defaultFilter (value: any, search: string | null, item: any) {
    //   return value != null &&
    //     search != null &&
    //     typeof value !== 'boolean' &&
    //     value.toString().toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) !== -1
    // }
    handleSearchInput (search) {
      this.updateSearch(search)
    },
    updateSearch: debounce(function (search) {
      // we debounce the search update, because updating this causes a potentially
      // heavy filter calculation to be run
      this.search = search
    }, 500),
    async handleEdit (item) {
      this.setSelectedProfileId(item.id)
      this.showEditor = true
      this.isEditing = true
    },
    async handleShow (item) {
      this.setSelectedProfileId(item.id)
      this.showEditor = true
    },
    close () {
      this.showEditor = false
      this.isEditing = false
    },
    handleSaved () {
      // Noted save has already been handled by component
      this.close()
      this.showAlert({ message: this.$t('viewPerson.profileUpdated'), color: 'green' })

      this.isLoading = true

      const newProfile = mergeAdminProfile(this.person(this.selectedProfileId))
      const search = this.search
      this.search = ''
      this.profilesIndex = this.profilesIndex
        .map(profile => {
          return this.mapProfileData(profile.id === this.selectedProfileId ? newProfile : profile)
        })
      this.search = search
      this.isLoading = false
    },
    showDeleteConfirmation (item) {
      if (item) this.setSelectedProfileId(item.id)
      this.close()
      this.showDelete = true
    },
    async handleDelete () {
      this.showDelete = false

      const updateId = await this.deletePerson({ id: this.selectedProfileId })

      // handle removing the profile from the list
      if (updateId) this.profilesIndex = this.profilesIndex.filter(profile => profile.id !== this.selectedProfileId)

      this.setSelectedProfileId(null)
    },
    altNames (altArray) {
      if (isEmpty(altArray)) return ''
      return altArray.join(', ')
    },
    computeDate (requiredDate, age) {
      if (!age) {
        return ''
      }
      let ageString = ''
      const dateSplit = dateIntervalToString(age, this.monthTranslations).split('-')
      if (requiredDate === 'dob') {
        if (dateSplit[0]) {
          ageString = dateSplit[0]
        }
      }
      if (requiredDate === 'dod') {
        if (dateSplit[1]) {
          ageString = dateSplit[1]
        }
      }
      return ageString
    },
    age (born) {
      const age = calculateAge(born)
      if (age || age === 0) {
        return age.toString()
      }
      return age
    },
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    downloadCsv () {
      const profiles = this.profilesIndex.map(profile => mapNodeToCsvRow(profile))
      const csv = csvFormat(profiles)

      const hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'people.csv'
      hiddenElement.click()
    }
  }
}
</script>

<style scoped lang="scss">
.peoples-list ::v-deep table td + td { border-left:1px solid #dddddd; }

.description {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.v-data-table > .v-data-table__wrapper > table > thead > tr:last-child > th {
  vertical-align: top;
}
</style>
