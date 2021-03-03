<template>
  <transition appear name="left">
    <v-navigation-drawer
      style="top: 64px;"
      :absolute="false"
      fixed
      right
      light
      width="21%"
      permanent
      height="calc(100vh - 64px)"
      class="side-menu"
    >
      <v-card light min-height="100%">
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
          <v-spacer style="height:400px"></v-spacer>
          <v-row class="nav-buttons">
            <v-btn @click="close" text large fab class="blue--text ml-5 filter-btn">
              Apply and Close
            </v-btn>
            <v-btn @click="reset" text large fab class="red--text ml-5 filter-btn">
              Clear
            </v-btn>
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
  data () {
    return {
      searchFilterString: '',
      searchNodeId: null
    }
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
    reset () {
      this.$emit('update:searchFilterString', '')
      this.close()
    }
  }
}
</script>

<style lang="scss">

.menu-title {
  padding: 50px 0px 50px 0px;
}

.nav-buttons {
  margin-left: 80px;
}

.filter-btn {
  margin: 0px 50px 0px 50px;
}

</style>
