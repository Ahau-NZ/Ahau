<template>
  <v-combobox
    v-model="searchString"
    :items="nodes"
    :menu-props="{ light: true }"
    hide-no-data
    append-icon="mdi-close"
    @click:append="close()"
    placeholder="Search"
    no-data-text="no suggestions"
    :search-input.sync="searchString"
    solo
    rounded
    light
    hide-selected
    dense
    class="search-input"
    autofocus
    max-width="700px"
  >
    <template v-slot:item="data" rounded>
      <template>
        <v-list-item @click="setSearchNode(data.item)">
          <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :bornAt="data.item.bornAt" />
          <v-list-item-content>
            <v-list-item-title> {{ data.item.preferredName }}</v-list-item-title>
            <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-content>
            <v-list-item-title> {{ data.item.legalName }}</v-list-item-title>
            <v-list-item-subtitle>Legal name</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-content>
            <v-list-item-title> {{ age(data.item.bornAt) }}</v-list-item-title>
            <v-list-item-subtitle>Age</v-list-item-subtitle>
          </v-list-item-content>
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

export default {
  name: 'SearchBar',
  components: {
    Avatar
  },
  props: {
    nestedWhakapapa: {
      type: Object
    },
    searchNodeId: {
      type: String
    }
  },
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    nodes () {
      return d3.hierarchy(this.nestedWhakapapa)
        .descendants()
        .map(d => d.data)
        .filter(d => {
          const search = this.setString(this.searchString)
          const preferredName = this.setString(d.preferredName)
          const legalName = this.setString(d.legalName)

          return (
            isEqual(preferredName, search) ||
            preferredName.includes(search) ||
            isEqual(legalName, search) ||
            legalName.includes(search)
          )
        })
    }
  },
  methods: {
    setName (name, limit) {
      if (name.length > limit) {
        return name.slice(0, limit) + '...'
      }
      return name
    },
    setString (name) {
      if (isEmpty(name)) return ''
      return name.toLowerCase().trim()
    },
    age (bornAt) {
      return calculateAge(bornAt)
    },
    close () {
      this.$emit('close')
    },
    setSearchNode (data) {
      this.searchString = data.preferredName
      this.$emit('update:searchNodeId', data.id)
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

</style>
