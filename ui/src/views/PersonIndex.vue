<template>
  <v-container v-if="isKaitiaki" fluid class="px-2 peoples-list" style="margin-top: 64px" >
    <v-card light flat>
      <v-card-title>
        {{ t('title') }}
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="mdi-magnify"
          :label="t('action.search')"
          single-line
          hide-details
          style="max-width: 20rem;"
          ref="search"
          class="pt-0"
          @input="handleSearchInput"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="profiles"
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
        class="mt-10"
        @click:row="handleShow"
      >
        <!-- Handle max description charachters -->
        <template v-slot:item.description="{ item }" >
          <span class="description">{{item.description}}</span>
        </template>
        <!-- Handle table actions -->
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="handleEdit(item)" >
            mdi-pencil
          </v-icon>
          <v-icon small class="mx-2" @click.stop="showDeleteConfirmation(item)" >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
        <div id="table-buttons">
          <v-btn small rounded outlined color="#383838" elevation="0" class="mx-2" @click="showImportDialog = true">
            <v-icon>mdi-file-upload</v-icon>
            <span class="pl-2">upload csv</span>
          </v-btn>
          <v-btn small rounded outlined color="#2f4f4f" class="mx-4" elevation="0" @click="downloadCsv">
            <v-icon>mdi-file-download</v-icon>
            <span class="pl-2">download csv</span>
          </v-btn>
        </div>
    </v-card>

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
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import debounce from 'lodash.debounce'
import isEmpty from 'lodash.isempty'
import { getDisplayName, mergeAdminProfile } from '@/lib/person-helpers.js'
import { dateIntervalToString } from '@/lib/date-helpers.js'
import calculateAge from '@/lib/calculate-age'
import { csvFormat } from 'd3'
import { mapNodeToCsvRow } from '@/lib/csv.js'

import SideNodeDialog from '@/components/dialog/profile/SideNodeDialog.vue'
import RemovePersonDialog from '@/components/dialog/profile/RemovePersonDialog.vue'
import ImportPeopleDialog from '@/components/dialog/ImportPeopleDialog.vue'

export default {
  name: 'PersonIndex',
  components: {
    SideNodeDialog,
    RemovePersonDialog,
    ImportPeopleDialog
  },
  data () {
    const header = (key, width) => ({
      value: key,
      text: this.t('prop.' + key),
      align: 'center',
      width: width || 'auto'
    })

    return {
      headers: [
        header('preferredName', '120px'),
        header('legalName', '150px'),
        header('altNames', '150px'),
        header('gender', '100px'),
        header('description', '200px'),
        header('age', '80px'),
        header('dob', '150px'),
        header('dod', '150px'),

        header('phone', '100px'), //   admin
        header('email', '100px'), //   admin
        header('address', '200px'), // admin
        header('city', '100px'),
        header('country', '100px'),
        header('postCode', '100px'),

        header('placeOfBirth', '100px'),
        header('birthOrder', '100px'),
        header('placeOfDeath', '100px'),
        header('buriedLocation', '100px'),
        header('profession', '100px'),
        header('education', '150px'),
        header('school', '150px'),

        { value: 'actions', text: '', align: 'end', width: '100px' } // this.t('action.edit')
      ],
      moreDetails: [
        // avatarImage?
      ],
      isLoading: false,
      profiles: [],
      showEditor: false,
      isEditing: false,
      showDelete: false,
      search: '',
      showImportDialog: false
    }
  },
  async mounted () {
    if (!this.isKaitiaki) return
    // NOTE this is a crude protection against a person changing tribe selection
    // and then magically being able to load this list
    await this.loadData()
  },
  watch: {
    async isKaitiaki (isKaitiaki) {
      if (isKaitiaki) await this.loadData()
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess', 'isKaitiaki']),
    ...mapGetters('person', ['person', 'selectedProfileId']),
    ...mapGetters('tribe', ['tribes']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    selectedProfile () {
      if (!this.selectedProfileId) return null

      return this.person(this.selectedProfileId)
    }
  },
  methods: {
    ...mapActions('person', ['loadPersonList', 'setSelectedProfileId', 'deletePerson']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('whakapapa', ['bulkCreateWhakapapaView']),
    ...mapActions(['setLoading']),
    getDisplayName,
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
      const profiles = await this.loadPersonList({ type: 'group', tribeId })
      this.profiles = await profiles.map(profile => {
        if (profile.aliveInterval) {
          profile.dob = this.computeDate('dob', profile.aliveInterval)
          profile.dod = this.computeDate('dod', profile.aliveInterval)
          profile.age = this.age(profile.aliveInterval)
        }
        return profile
      })
      this.isLoading = false
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
      this.profiles = this.profiles.map(profile => profile.id === this.selectedProfileId ? newProfile : profile)
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
      if (updateId) this.profiles = this.profiles.filter(profile => profile.id !== this.selectedProfileId)

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
      const profiles = this.profiles.map(profile => mapNodeToCsvRow(profile))
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

#table-buttons {
  position: relative;
  top: -40px;
  max-width: 50%
}
</style>
