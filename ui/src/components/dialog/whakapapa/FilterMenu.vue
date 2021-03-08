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
      <v-card light height="90%" class="text-center" flat>
        <v-container>
          <v-row class="menu-title">
            <v-col cols="12">
              <h1>Apply Table Filters</h1>
            </v-col>
            <v-col>
              <p class="profile-label overline">
                Name
              </p>
            </v-col>
            <v-col cols="12">
              <SearchBar
                :searchNodeId.sync="searchNodeId"
                :searchFilterString.sync="searchFilterString"
                :searchFilter="true"
                @close="clickedOffSearchFilter()"
              />
            </v-col>
          </v-row>
        </v-container>
        <v-spacer />
        <v-card-actions class="pa-0">
          <v-row>
            <v-col cols="12">
              <v-btn @click="close" text large color="blue">
                Apply and Close
              </v-btn>
              <v-btn @click="reset" text large color="red">
                Clear
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
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
