<template>
  <v-combobox
    v-model="searchString"
    :items="items"
    :search-input.sync="searchString"
    :menu-props=" { light: true } "
    light
    hide-selected
    hide-details
    dense
    v-bind="customProps"
    @click:append="close()"
  >
    <template v-slot:item="data">
      <v-list-item @click="setSearchNode(data.item, $event)">
        <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :aliveInterval="data.item.aliveInterval" />
        <v-list-item-content>
          <v-list-item-title> {{ data.item.preferredName }}</v-list-item-title>
          <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-content>
          <v-list-item-title> {{ data.item.legalName }}</v-list-item-title>
          <v-list-item-subtitle>Legal name</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-list-item-title>{{ age(data.item.aliveInterval) }}</v-list-item-title>
          <v-list-item-subtitle>Age</v-list-item-subtitle>
        </v-list-item-action>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script>
import * as d3 from 'd3'
import Avatar from '@/components/Avatar.vue'

import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'

import calculateAge from '../../lib/calculate-age'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters: mapWhakapapaGetters } = createNamespacedHelpers('whakapapa')
const { mapGetters: mapTableGetters } = createNamespacedHelpers('table')

export default {
  name: 'SearchBar',
  components: {
    Avatar
  },
  props: {
    searchNodeId: String,
    isFilter: Boolean,
    searchNodeName: String,
    reset: Boolean,
    buttonGroup: Boolean
  },
  data () {
    return {
      searchString: '',
      activeNode: null
    }
  },
  computed: {
    ...mapWhakapapaGetters(['nestedWhakapapa']),
    ...mapTableGetters(['tableFilter']),

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
          appendIcon: this.searchNodeId ? '' : 'mdi-arrow-right',
          placeholder: 'Search',
          noDataText: 'no suggestions',
          rounded: true,
          readonly: this.searchNodeId !== '',
          class: 'searchbar-input',
          autofocus: true,
          solo: true
        }
      }
    },
    nodes () {
      return d3.hierarchy(this.nestedWhakapapa)
        .descendants()
        .map(d => d.data)
        .filter(d => {
          const search = this.setString(this.searchString)
          const preferredName = this.setString(d.preferredName)
          const legalName = this.setString(d.legalName)

          var altNameMatch = false
          const altNames = d.altNames
          if (altNames.length > 0) {
            for (var i = 0; i < altNames.length; i++) {
              const currAltName = this.setString(altNames[i])
              if (isEqual(currAltName, search) || currAltName.includes(search)) {
                altNameMatch = true
              }
            }
          }
          return (
            isEqual(preferredName, search) ||
            preferredName.includes(search) ||
            isEqual(legalName, search) ||
            legalName.includes(search) ||
            altNameMatch
          )
        })
    },
    items () {
      if (this.isFilter) return []
      return this.nodes
    }
  },
  // Reset search string if filters are reset
  created: function () {
    if (this.isFilter) this.$parent.$parent.$on('update', this.close)
  },
  watch: {
    searchString (newValue) {
      this.$emit('change', newValue)
    },
    reset (newVal) {
      if (newVal) this.searchString = ''
    }
  },
  methods: {
    setString (name) {
      if (isEmpty(name)) return ''
      return name.toLowerCase().trim()
    },
    age (aliveInterval) {
      return calculateAge(aliveInterval)
    },
    close () {
      if (this.isFilter) this.searchString = ''
      else this.$emit('close')
    },
    setSearchNode (data, event) {
      this.searchString = data.preferredName
      this.activeNode = data
      this.$emit('update:searchNodeName', data.preferredName || data.legalName)
      this.$emit('update:searchNodeId', data.id)
      this.$emit('searchNode', event)
    },
    clearSearchNodeId () {
      this.$emit('update:searchNodeId', '')
    }
  }
}
</script>

<style>
   .v-text-field.v-input--dense .v-input__append-inner .v-input__icon > .v-icon {
     margin: 0px;
   }
</style>

<style scoped lang="scss">
  .searchbar-input {
    padding: 0;
    margin: 0;
    margin-top: -3px;
  }

</style>
