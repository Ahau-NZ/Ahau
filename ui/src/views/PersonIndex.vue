<template>
  <v-container v-if="isKaitiaki" fluid class="px-2" style="margin-top: 64px" >
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

        light

        class="mt-10"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="handleEdit(item)" >
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <SideNodeDialog v-if="showEditor && selectedProfileId"
      :show="showEditor"
      :profileId="selectedProfileId"

      deleteable
      editing
      fullForm

      @close="showEditor = false"
      @cancel="showEditor = false"
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
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import debounce from 'lodash.debounce'

import SideNodeDialog from '@/components/dialog/profile/SideNodeDialog.vue'
import RemovePersonDialog from '@/components/dialog/profile/RemovePersonDialog.vue'
import { getDisplayName, mergeAdminProfile } from '@/lib/person-helpers.js'

export default {
  name: 'PersonList',
  components: {
    SideNodeDialog,
    RemovePersonDialog
  },
  data () {
    const header = (key) => ({
      value: key,
      text: this.t('prop.' + key),
      align: 'start'
    })

    return {
      headers: [
        header('preferredName'),
        header('legalName'),
        header('altNames'),
        header('gender'),
        header('description'),
        header('aliveInterval'),

        header('phone'), //   admin
        header('email'), //   admin
        header('address'), // admin
        header('city'),
        header('country'),
        header('postCode'),

        header('placeOfBirth'),
        header('birthOrder'),
        header('placeOfDeath'),
        header('buriedLocation'),
        header('profession'),
        header('education'),
        header('school'),

        { value: 'actions', text: '', align: 'end' } // this.t('action.edit')
      ],
      moreDetails: [
        // avatarImage?
      ],
      isLoading: false,
      profiles: [],
      showEditor: false,
      showDelete: false,
      search: ''
    }
  },
  async mounted () {
    if (!this.isKaitiaki) return
    // NOTE this is a crude protection against a person changing tribe selection
    // and then magically being able to load this list

    this.isLoading = true
    await this.loadData()

    this.isLoading = false
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
    ...mapActions('person', ['loadPersonList', 'loadPersonFull', 'updatePerson', 'setSelectedProfileId', 'deletePerson']),
    ...mapActions('alerts', ['showAlert']),
    t (key) {
      return this.$t('personIndex.' + key)
    },
    getDisplayName,
    async loadData () {
      const { tribeId } = this.$route.params
      this.profiles = await this.loadPersonList({ type: 'group', tribeId })
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
    },
    handleSaved () {
      // Noted save has already been handled by component
      this.showEditor = false
      this.showAlert({ message: this.$t('viewPerson.profileUpdated'), color: 'green' })

      this.isLoading = true
      const newProfile = mergeAdminProfile(this.person(this.selectedProfileId))
      const search = this.search
      this.search = ''
      this.profiles = this.profiles.map(profile => profile.id === this.selectedProfileId ? newProfile : profile)
      this.search = search
      this.isLoading = false
    },
    showDeleteConfirmation () {
      this.showEditor = false
      this.showDelete = true
    },
    async handleDelete () {
      this.showDelete = false

      const updateId = await this.deletePerson({ id: this.selectedProfileId })

      // handle removing the profile from the list
      if (updateId) this.profiles = this.profiles.filter(profile => profile.id !== this.selectedProfileId)

      this.setSelectedProfileId(null)
    }
  }
}
</script>

<style scoped lang="scss">
</style>

<style lang="scss">
.v-data-table > .v-data-table__wrapper > table > thead > tr:last-child > th {
  vertical-align: top;
}

</style>
