<template>
  <v-container v-if='isKaitiaki' fluid class='px-2' style='margin-top: 64px' >
    <v-card light flat>
      <v-card-title>
        {{ t('title') }}
        <v-spacer></v-spacer>
        <v-text-field
          append-icon='mdi-magnify'
          :label='t("action.search")'
          single-line
          hide-details

          style='max-width: 20rem;'
          ref='search'
          @input='handleSearchInput' />
      </v-card-title>

      <v-data-table
        :headers='headers'
        :items='profiles'
        item-key='id'

        :loading='isLoading'
        :loading-text='t("loading")'

        :search='search'
        :customFilter='searchFilter'

        light

        class='mt-10'
      >
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="handleEdit(item)" >
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <SideNodeDialog v-if='showEditor && selectedProfileId'
      :show='showEditor'
      :profileId='selectedProfileId'

      deleteable
      editing
      fullForm

      @close='showEditor = false'
      @cancel='showEditor = false'
      @delete='handleDelete'
      @saved='handleSaved'
    />
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import debounce from 'lodash.debounce'

import SideNodeDialog from '@/components/dialog/profile/SideNodeDialog.vue'
import { getDisplayName, mergeAdminProfile } from '@/lib/person-helpers.js'

export default {
  name: 'PersonList',
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
      search: ''
    }
  },
  computed: {
    ...mapGetters(['whoami', 'currentAccess', 'isKaitiaki']),
    ...mapGetters('person', ['person', 'selectedProfileId']),
    ...mapGetters('tribe', ['tribes']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  async mounted () {
    if (!this.isKaitiaki) return
    // NOTE this is a crude protection against a person changing tribe selection
    // and then magically being able to load this list

    this.isLoading = true
    const { tribeId } = this.$route.params
    this.profiles = await this.loadPersonList({ type: 'group', tribeId })

    this.isLoading = false
  },
  methods: {
    ...mapActions('person', ['loadPersonList', 'loadPersonFull', 'updatePerson', 'setSelectedProfileId']),
    ...mapActions('alerts', ['showAlert']),
    t (key) {
      return this.$t('personIndex.' + key)
    },
    getDisplayName,
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
      console.log('update:search', search)
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
    // if (this.whoami.personal.profile.id === this.selectedProfileId) await this.setWhoami()
    // NEEDED?
    handleDelete () {
      this.showAlert({ message: 'Please delete profiles from whakapapa trees (under construction)', color: 'red' })
      // :fire: WARNING - when deleting we needt to:
      // - [ ] check it's safe to delete this profile (if it's ours, or "owned" we should not)
      // - [ ] when we delete, also delete all links that pointed to this (so we're not clogging up graphs)
    }
  },
  components: {
    SideNodeDialog
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
