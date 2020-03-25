<template>
  <v-combobox
    v-model="searchString"
    :items="nodes"
    item-text="preferredName"
    item-value="preferredName"
    :menu-props="{ light: true }"
    :clearable="hasSelection"
    hide-no-data
    append-icon="mdi-magnify"
    @click:append="close()"
    placeholder="Search"
    @click:clear="reset()"
    no-data-text="no suggestions"
    :search-input.sync="searchString"
    outlined
    rounded
    light
    hide-selected
    underlined
    dense
  >
    <template v-slot:item="data">
      <template>
        <v-list-item @click="setSearchNode(data.item)">
          <v-row>
            <v-col class="pa-0" cols="2">
              <Avatar size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :bornAt="data.item.bornAt" />
            </v-col>
            <v-col cols="2">
              <small>{{ data.item.preferredName }}</small>
            </v-col>
            <v-col cols="5">
              <small>{{ data.item.legalName }}</small>
            </v-col>
            <v-col cols="3">
              <small>{{ age(data.item.bornAt) }}</small>
            </v-col>
          </v-row>
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
      type: Object,
      default: () => ({
        preferredName: 'Loading',
        gender: 'unknown',
        children: [],
        parents: []
      })
    },
    searchNodeId: {
      type: String
    }
  },
  data () {
    return {
      searchString: '',
      hasSelection: false
    }
  },
  computed: {
    nodes () {
      return d3.hierarchy(this.nestedWhakapapa)
        .descendants()
        .map(d => d.data)
        .filter(d => {
          if (isEmpty(this.searchString) || isEmpty(d.preferredName)) return false
          const search = this.searchString.toLowerCase().trim()
          const preferredName = d.preferredName.toLowerCase().trim()
          return (
            isEqual(preferredName, search) ||
            preferredName.includes(search)
          )
        })
    }
  },
  methods: {
    age (bornAt) {
      return calculateAge(bornAt)
    },
    close () {
      this.$emit('close')
    },
    setSearchNode (data) {
      this.searchString = data.preferredName
      this.hasSelection = true
      this.$emit('update:searchNodeId', data.id)
    },
    reset () {
      this.searchString = ''
      this.hasSelected = false
      this.$emit('update:searchNodeId', '')
    }
  }
}
</script>
