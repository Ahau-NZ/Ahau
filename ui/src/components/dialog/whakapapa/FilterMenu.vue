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
            <v-col cols="12">
              <h1>{{ t('applyTableFilters') }}</h1>
            </v-col>
          <v-row>
            <v-col>
              <p class="profile-label overline" style="">
                {{ t('name') }}
              </p>
              <SearchBar
                @change="updateTableFilter({ type: 'name', value: $event})"
                isFilter
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p class="profile-label overline">
                {{ t('location') }}
              </p>
              <SearchBar
                @change="updateTableFilter({ type: 'location', value: $event})"
                isFilter
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p class="profile-label overline">
                {{ t('skills') }}
              </p>
              <SearchBar
                @change="updateTableFilter({ type: 'skills', value: $event})"
                isFilter
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p class="profile-label overline">
                {{ t('age') }}
              </p>
              <v-range-slider
                v-model="ageRange"
                min="0"
                max="150"
                hide-details
                class="align-center mt-12"
                thumb-label="always"
              >
                <template v-slot:prepend>
                  <p class="profile-label overline">{{ t('min') }}</p>
                </template>
                <template v-slot:append>
                  <p class="profile-label overline">{{ t('max') }}</p>
                </template>
              </v-range-slider>
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
import { createNamespacedHelpers } from 'vuex'

const { mapActions: mapTableActions, mapGetters: mapTableGetters } = createNamespacedHelpers('table')

export default {
  name: 'FilterMenu',
  components: {
    SearchBar
  },
  data () {
    return {
      searchNodeId: null,
      ageRange: [0, 150]
    }
  },
  computed: {
    ...mapTableGetters(['tableFilter'])
  },
  watch: {
    ageRange ([min, max]) {
      this.updateTableFilter({ type: 'age', value: { min, max } })
    }
  },
  methods: {
    ...mapTableActions(['updateTableFilter', 'resetTableFilters']),
    close () {
      this.$emit('close')
    },
    reset () {
      this.resetTableFilters()
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
