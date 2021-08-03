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
          <v-row class="justify-end">
          <v-btn icon class="mr-3">
            <v-icon @click="reset" color="secondary">mdi-close</v-icon>
          </v-btn>
        </v-row>
          <v-row class="menu-title">
            <v-col cols="12">
              <h1>{{ t('applyTableFilters') }}</h1>
            </v-col>
            <v-col>
              <p class="profile-label overline">
                {{ t('name') }}
              </p>
            </v-col>
            <v-col cols="12">
              <SearchBar
                :searchFilterString.sync="searchFilterString"
                :searchFilter="true"
              />
            </v-col>
            <v-col>
              <p class="profile-label overline">
                {{ t('location') }}
              </p>
            </v-col>
            <v-col cols="12">
              <SearchBar
                :locationFilterString.sync="locationFilterString"
                :locationFilter="true"
              />
            </v-col>
            <v-col>
              <p class="profile-label overline">
                {{ t('age') }}
              </p>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="lowerAgeFilter"
                :label="t('lowerAge')"
                :error="ageError"
              />
              <v-text-field
                v-model="upperAgeFilter"
                :label="t('upperAge')"
                :error="ageError"
              />
              <v-col v-if="ageError" style="color: red;" cols="12 pa-0" align="center" class="custom-label">
                {{ ageErrorMessage }}
              </v-col>
            </v-col>
          </v-row>
        </v-container>
        <v-spacer />
        <v-card-actions class="pa-0">
          <v-row>
            <v-col cols="12">
              <v-btn @click="close" text large color="blue">
                {{ t('apply') }}
              </v-btn>
              <v-btn @click="reset" text large color="red">
                {{ t('cancel') }}
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
      locationFilterString: '',
      lowerAgeFilter: '',
      upperAgeFilter: '',
      ageErrorMessage: '',
      searchNodeId: null
    }
  },
  watch: {
    searchFilterString (newValue) {
      this.$emit('update:searchFilterString', newValue)
    },
    locationFilterString (newValue) {
      this.$emit('update:locationFilterString', newValue)
    },
    lowerAgeFilter (newValue) {
      const upper = parseInt(this.upperAgeFilter)
      const lower = parseInt(newValue)
      const invalidRange = lower >= upper || lower < 0

      if (isNaN(lower)) this.ageErrorMessage = this.t('validLower')
      else if (isNaN(upper)) this.ageErrorMessage = this.t('validUpper')
      else if (invalidRange) this.ageErrorMessage = this.t('invalidRange')
      else {
        this.ageErrorMessage = ''
        this.$emit('update:lowerAgeFilter', lower)
        this.$emit('update:upperAgeFilter', upper)
      }
    },
    upperAgeFilter (newValue) {
      const lower = parseInt(this.lowerAgeFilter)
      const upper = parseInt(newValue)
      const invalidRange = lower >= upper || lower < 0

      if (isNaN(upper)) this.ageErrorMessage = this.t('validUpper')
      else if (isNaN(lower)) this.ageErrorMessage = this.t('validLower')
      else if (invalidRange) this.ageErrorMessage = this.t('invalidRange')
      else {
        this.ageErrorMessage = ''
        this.$emit('update:lowerAgeFilter', lower)
        this.$emit('update:upperAgeFilter', upper)
      }
    },
    ageErrorMessage (newValue) {
      if (newValue !== '') {
        this.$emit('update:lowerAgeFilter', 0)
        this.$emit('update:upperAgeFilter', 0)
      }
    }
  },
  computed: {
    ageError () {
      return this.ageErrorMessage !== ''
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    reset () {
      this.$emit('update:searchFilterString', '')
      this.$emit('update:locationFilterString', '')
      this.$emit('update:lowerAgeFilter', 0)
      this.$emit('update:upperAgeFilter', 0)
      this.close()
    },
    t (key, vars) {
      return this.$t('whakapapaTable.' + key, vars)
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
