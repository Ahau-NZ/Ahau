<template>
  <v-combobox
    :value="displayText"
    @input="event => searchString = event.target.value"
    :items="items"
    :search-input.sync="searchString"
    :menu-props=" { light: true, closeOnContentClick: true } "
    light
    attach
    hide-selected
    hide-details
    hide-no-data
    dense
    v-bind="customProps"
    @click:append="close"
  >
    <template v-slot:item="data">
      <!--
        Loading item in the list
        NOTE: doing a custom item in the list instead of using built in append-item slot because
        the other one had issues displaying an item when there were no items (it used the no-data slot)
      -->
      <v-list-item v-if="data.item.type === 'loading'">
        <v-list-item-icon>
          <v-progress-circular indeterminate color="#b12526" />
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ loadingText }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <!-- Profile in the list -->
      <v-list-item v-else @click="setSearchNode(data.item, $event)">
        <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :aliveInterval="data.item.aliveInterval" />
        <v-list-item-content v-if="data.item.preferredName">
          <v-list-item-title> {{ data.item.preferredName }}</v-list-item-title>
          <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-content v-if="data.item.legalName">
          <v-list-item-title> {{ data.item.legalName }}</v-list-item-title>
          <v-list-item-subtitle>Legal name</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action v-if="age(data.item.aliveInterval)">
          <v-list-item-title>{{ age(data.item.aliveInterval) }}</v-list-item-title>
          <v-list-item-subtitle>Age</v-list-item-subtitle>
        </v-list-item-action>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import Avatar from '@/components/Avatar.vue'
import calculateAge from '../../lib/calculate-age'

export default {
  name: 'SearchBar',
  components: {
    Avatar
  },
  props: {
    isFilter: Boolean,
    reset: Boolean,
    buttonGroup: Boolean
  },
  data () {
    return {
      timer: undefined,
      searchString: '',
      suggestions: [],
      isLoadingSuggestions: false
    }
  },
  computed: {
    ...mapGetters('whakapapa', ['whakapapaView', 'isInWhakapapa', 'isLoadingWhakapapa']),
    ...mapGetters('tribe', ['currentTribe']),
    ...mapGetters('tree', ['descendants', 'searchedProfileId']),
    ...mapGetters('person', ['person']),
    ...mapGetters('table', ['tableFilter']),

    hasSelection () {
      return Boolean(this.searchedProfileId)
    },
    displayText () {
      if (!this.hasSelection) return this.searchString
      const name = this.searchedProfile && (this.searchedProfile.preferredName || this.searchedProfile.legalName)
      return name
        ? 'Selected: ' + name
        : this.searchString
    },
    searchedProfile () {
      if (!this.hasSelection) return null
      const profile = this.person(this.searchedProfileId)
      if (!profile) this.loadPersonMinimal(this.searchedProfileId)
      // HACK - make sure profile is loaded

      return profile
    },
    customProps () {
      if (this.isFilter) {
        return {
          appendIcon: 'mdi-close',
          outlined: true,
          class: 'search-input-filter',
          flat: true
        }
      } else if (this.buttonGroup) {
        return {
          outlined: false,
          appendIcon: 'mdi-close',
          flat: true
        }
      } else {
        return {
          outlined: true,
          appendIcon: this.hasSelection ? 'mdi-close' : 'mdi-magnify',
          placeholder: 'Search',
          rounded: true,
          readonly: this.hasSelection,
          class: 'searchbar-input',
          solo: true
        }
      }
    },
    isLoading () {
      return this.isLoadingWhakapapa || this.isLoadingSuggestions
    },
    loadingText () {
      // TODO i18n / translate
      if (this.isLoadingWhakapapa) return 'Loading profiles in this whakapapa'
      if (this.isLoadingSuggestions) return 'Searching for profiles'
      return '' // shouldnt reach here
    },
    items () {
      if (this.isFilter) return []
      const suggestions = this.suggestions
        .filter(person => this.isInWhakapapa(person.id))

      if (this.isLoading) suggestions.push({ type: 'loading' })

      return suggestions
    }
  },
  // Reset search string if filters are reset
  created: function () {
    if (this.isFilter) this.$parent.$parent.$on('update', this.close)
  },
  watch: {
    async searchString (name) {
      if (this.isFilter) {
        this.$emit('change', name)
        return
      }

      clearTimeout(this.timer)
      this.setLoadingSuggestions(false)

      if (!name || name.length <= 2) {
        this.suggestions = []
        return
      }

      this.setLoadingSuggestions(true)
      this.timer = setTimeout(async () => {
        this.suggestions = await this.findPersonsByNameWithinGroup(name)
        this.setLoadingSuggestions(false)
      }, 500)
    },
    reset (newVal) {
      if (newVal) this.searchString = ''
    }
  },
  methods: {
    ...mapActions('person', ['findPersonsByNameWithinGroup', 'loadPersonMinimal']),
    ...mapActions('tree', ['setSearchedProfileId', 'setMouseEvent']),
    age (aliveInterval) {
      return calculateAge(aliveInterval)
    },
    close () {
      if (this.isFilter) this.searchString = ''
      else if (this.hasSelection) {
        this.setSearchedProfileId(null)
        this.searchString = ''
      } else this.$emit('close')
    },
    setSearchNode (data, e) {
      this.setSearchedProfileId(data.id)
      this.setMouseEvent(e)
    },
    setLoadingSuggestions (isLoading) {
      this.isLoadingSuggestions = isLoading
    }
  }
}
</script>

<style>
.v-text-field.v-input--dense .v-input__append-inner .v-input__icon > .v-icon {
  margin: 0px;
}

.v-autocomplete__content.v-menu__content {
  border-radius: 7px;
}
</style>

<style scoped lang="scss">
.searchbar-input {
  padding: 0;
  margin: 0;
  margin-top: -3px;
}
</style>
