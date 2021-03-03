<template>
  <v-combobox
    v-model="searchString"
    :items="nodes"
    :menu-props=" { light: true } "
    hide-no-data
    :append-icon="!searchFilter ? 'mdi-close' : ''"
    @click:append="close()"
    placeholder="Search"
    :no-data-text="searchFilter ? '' : 'no suggestions'"
    :search-input.sync="searchString"
    solo
    rounded
    light
    hide-selected
    dense
    :class="searchFilter ? 'search-input-filter' : 'search-input'"
    autofocus
  >
    <template v-slot:item="data">
      <!-- not sure why v-if="!searchFilter" is needed both here and the line below, but seems it is needed in both places to prevent a blank v-list-item when showing when filtering--->
      <template v-if="!searchFilter">
        <v-list-item @click="setSearchNode(data.item, $event)" v-if="!searchFilter">
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
    </template>
  </v-combobox>
</template>

<script>
import * as d3 from 'd3'
import Avatar from '@/components/Avatar.vue'

import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'

import calculateAge from '../../lib/calculate-age'
import { mapGetters } from 'vuex'

export default {
  name: 'SearchBar',
  components: {
    Avatar
  },
  props: {
    // nestedWhakapapa: {
    //   type: Object
    // },
    searchNodeId: {
      type: String
    },
    searchFilter: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    ...mapGetters(['nestedWhakapapa']),
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
    }
  },
  watch: {
    searchString (newValue) {
      if (this.searchFilter) this.$emit('update:searchFilterString', newValue)
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
      this.$emit('update:searchFilterString', '')
      this.$emit('close')
    },
    setSearchNode (data, event) {
      this.searchString = data.preferredName
      this.$emit('update:searchNodeId', data.id)
      this.$emit('searchNode', event)
      this.$emit('close')
    },
    reset () {
      this.searchString = ''
      this.$emit('update:searchNodeId', '')
      this.$emit('close')
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
  .search-input {
    padding: 0;
    margin: 0;
    margin-top: -3px;
  }

  .search-input-filter {
    margin: 0px 25px 0px 25px;
  }

</style>
