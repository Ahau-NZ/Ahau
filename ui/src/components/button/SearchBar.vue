<template>
  <v-combobox
    v-model="searchString"
    :items="nodes"
    item-text="preferredName"
    item-value="preferredName"
    :menu-props="{ light: true }"
    :clearable="hasSelection"
    hide-no-data
    append-icon=""
    @click:clear="reset()"
    no-data-text="no suggestions"
    :search-input.sync="searchString"
    :filter="filter"
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
              <small>{{ data.item.bornAt ? data.item.bornAt.slice(0, 10) : '' }}</small>
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
          if (isEmpty(this.searchString)) return false
          const search = this.searchString.toLowerCase()
          return d.preferredName.toLowerCase().includes(search)
        })
    }
  },
  methods: {
    setSearchNode (data) {
      this.$emit('update:searchNodeId', data.id)
    },
    filter (item, queryText, itemText) {
      const hasValue = val => val != null ? val : ''

      const text = hasValue(itemText)
      const query = hasValue(queryText)

      return text.toString()
        .toLowerCase()
        .indexOf(query.toString().toLowerCase()) > -1
    }
  },
  watch: {
    searchInput (newValue) {
      if (!newValue) return
      if (newValue.length > 2) {
        if (!this.hasSelection) {
          this.$emit('getSuggestions', newValue)
        }
      } else {
        this.$emit('getSuggestions', null)
      }
    },
    hasSelection (newValue) {
      if (newValue) {
        this.$emit('getSuggestions', null)
      }
    }
  }
}
</script>
