<template>
  <transition appear name='left'>
    <v-navigation-drawer
      style='top: 64px;'
      :absolute="false"
      :fixed="true"
      :right="true"
      light
      width='21%'
      permanent
      height='calc(100vh - 64px)'
      class="side-menu"
    >
      <v-card light min-height="100%">
        <v-row class="justify-end">
          <v-btn icon class="mr-3">
            <v-icon @click="close" color="secondary">mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-container>
          <v-row class="justify-center menu-title">
            <h1>Apply Table Filters</h1>
          </v-row>
          <v-row>
            <v-col class="py-1 px-0 profile-label overline">
              Name
            </v-col>
          </v-row>
          <v-row>
            <v-col class="py-1 px-0 profile-label overline">
              <SearchBar
                :searchNodeId.sync="searchNodeId"
                :searchFilterString.sync="searchFilterString"
                :searchFilter="true"
                @close="clickedOffSearchFilter()"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-navigation-drawer>
  </transition>
</template>

<script>
import SearchBar from '@/components/button/SearchBar.vue'

export default {
  name: 'FilterMenu',
  components: {
    SearchBar
  },
  props: {
  },

  data () {
    return {
      searchFilterString: '',
      searchNodeId: null
    }
  },
  computed: {
  },
  watch: {
    searchFilterString (newValue) {
      this.$emit('update:searchFilterString', newValue)
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    printSearchFilterString () {
      console.log('filter search: ', this.searchFilterString)
    }
  }
}
</script>

<style lang="scss">

.menu-title {
  padding-bottom: 50px;
}

</style>
