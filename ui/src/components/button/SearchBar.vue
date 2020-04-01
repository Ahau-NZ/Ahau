<template>
  <v-combobox
    v-model="searchString"
    :items="nodes"
    item-text="preferredName"
    item-value="preferredName"
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
    underlined
    dense
    class="search-input"
    autofocus
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
