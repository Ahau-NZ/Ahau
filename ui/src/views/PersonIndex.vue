<template>
  <v-container v-if="isKaitiaki" fluid class="px-2 pt-8 peoples-list" style="margin-top: 64px;max-height:80vh;">
    <v-row class="d-flex justify-end" align-items="right" no-gutters>
      <v-col cols="12" md="auto" class="headliner black--text pl-2" :class="mobile && 'mb-6'">
        {{ t('title')}}
      </v-col>
      <v-spacer v-if="!mobile" />
      <v-col class="d-flex justify-end d-inline">
        <v-icon color="blue-grey" class="mx-3" @click="addPerson">mdi-account-plus</v-icon>
        <v-icon color="blue-grey" class="mx-3" @click="loadData(true)">mdi-refresh</v-icon>
        <v-icon color="blue-grey" class="mx-3" @click="toggleSettings">mdi-cog</v-icon>
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
      </v-col>
    </v-row>
    <v-row :class="mobile && 'pt-6'">
      <v-col>
        <v-data-table
          :headers="activeHeaders"
          fixed-header
          height="calc(100vh - 255px)"
          :items="profilesArr"
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
          <template v-slot:item.avatarImage="{ item }" > <!-- eslint-disable-line -->
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
            <v-icon v-if="!isMyProfile(item.id)" small class="mx-2" @click.stop="showDeleteConfirmation(item)" >
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
import { csvFormat } from 'd3'
import { mapNodeToCsvRow } from '@/lib/csv.js'
import ImportPeopleDialog from '@/components/dialog/ImportPeopleDialog.vue'
import FilterMenu from '@/components/dialog/whakapapa/FilterMenu.vue'
import Avatar from '@/components/Avatar.vue'
import { mapLabelToProp } from '../lib/custom-field-helpers'

export default {
  name: 'PersonIndex',
  components: {
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
      defaultHeaders: [
        header('avatarImage', '80px', true, true),
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
        header('profession', '110px', true),
        header('education', '150px', true),
        header('school', '150px', true)
      ],
      headers: [],
      isLoading: false,
      profilesIndex: [],
      showEditor: false,
      isEditing: false,
      showDelete: false,
      search: '',
      showImportDialog: false,
      settingsPanel: false,
      unsubscribe: null
    }
  },
  async mounted () {
    if (!this.isKaitiaki) return
    // NOTE this is a crude protection against a person changing tribe selection
    // and then magically being able to load this list
    await this.loadData()
    this.populateHeaders()
  },
  watch: {
    async isKaitiaki (isKaitiaki) {
      if (isKaitiaki) {
        await this.loadData()
        this.populateHeaders()
      }
    }
  },
  computed: {
    ...mapGetters(['isMyProfile']),
    ...mapGetters(['whoami', 'currentAccess', 'isKaitiaki']),
    ...mapGetters('person', ['person', 'selectedProfileId', 'profilesArr']),
    ...mapGetters('tribe', ['tribes', 'tribeCustomFields', 'tribeDefaultFields', 'currentTribe']),
    ...mapGetters('table', ['tableFilter']),
    activeHeaders () {
      return [
        ...this.headers
          .filter(header => header.show),

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
    hiddenColumns () {
      return (this.headers.length - this.activeHeaders.length) + 1
    }
  },
  methods: {
    ...mapActions('person', ['loadPersonList', 'setSelectedProfileId', 'deletePerson', 'loadPersonFull']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('whakapapa', ['bulkCreateWhakapapaView']),
    ...mapActions(['setLoading', 'setDialog']),
    addPerson () {
      this.setDialog({
        active: 'new-person',
        type: 'person',
        source: null
      })
    },
    populateHeaders () {
      const defaultHeaders = this.defaultHeaders
        .filter(header => {
          return this.tribeDefaultFields.some(fieldDef => {
            const key = mapLabelToProp(fieldDef.label)
            return header.value === key
          })
        })

      this.headers.push(...defaultHeaders)
      this.headers.push(...this.customFieldHeaders)
    },
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
    async loadData (refresh) {
      this.isLoading = true
      // if dont have the profiles, wait for them to load before showing them
      if (!this.profilesArr.length || refresh) await this.loadPersonList()
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
      this.setDialog({
        active: 'view-edit-person',
        type: 'editing',
        source: null
      })
    },
    async handleShow (item) {
      this.setSelectedProfileId(item.id)
      this.setDialog({
        active: 'view-edit-person',
        type: null,
        source: null
      })
    },
    close () {
      this.showEditor = false
      this.isEditing = false
    },
    showDeleteConfirmation (item) {
      if (item) this.setSelectedProfileId(item.id)
      this.close()
      this.setDialog({
        active: 'delete-person',
        type: null,
        source: null
      })
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
  },
  beforeDestroy () {
    this.setDialog(null)
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
