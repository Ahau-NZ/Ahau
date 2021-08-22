<template>
  <div>
    <v-divider />
    <v-row @click="show = !show" class="pointer">
      <v-col align="start">
        <v-row class="pl-2">
          <v-icon :class="active.length ? 'blue--text':''" small >mdi-filter-variant</v-icon>
          <span :class="active.length ? 'blue--text':''" class="pa-0 ma-0 pl-2">{{ t('filter') }}:</span>
          <div v-if="active.length">
            <span v-for="a in active" :key="a" style="font-size:smaller" class="blue--text pa-0 ma-0 pl-2">{{a}},</span>
          </div>
        </v-row>
        </v-col>
        <v-btn icon right>
          <v-icon class="pt-3">{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
    </v-row>
    <v-expand-transition>
      <div v-show="show">
        <v-row>
          <v-col align="start" class="pb-0">
            <p class="caption mb-0">
              {{ t('name') }}
            </p>
            <SearchBar
              @change="updateFilter({ type: 'name', value: $event})"
              isFilter
              :reset="reset"
            />
            <!-- <SearchBar
              @change="updateTableFilter({ type: 'name', value: $event})"
              isFilter
            /> -->
          </v-col>
        </v-row>
        <v-row>
          <v-col align="start" class="pb-0">
            <p class="caption mb-0">
              {{ t('location') }}
            </p>
            <SearchBar
              @change="updateFilter({ type: 'location', value: $event})"
              isFilter
              :reset="reset"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col align="start" class="pb-0">
            <p class="caption mb-0">
              {{ t('skills') }}
            </p>
            <SearchBar
              @change="updateFilter({ type: 'skills', value: $event})"
              isFilter
              :reset="reset"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col align="start" class="pb-0">
            <p class="caption mb-0">
              {{ t('ageRange') }}
            </p>
            <v-row>
              <v-col  class="pt-0">
                <v-select
                  v-model="ageRange.min"
                  :menu-props=" { light: true } "
                  :items="number"
                  label="min"
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="2" class="pt-0">
                <p>to</p>
              </v-col>
              <v-col class="pt-0">
                <v-select
                  v-model="ageRange.max"
                  :items="number"
                  :menu-props=" { light: true } "
                  label="max"
                  outlined
                  dense
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import SearchBar from '@/components/button/SearchBar.vue'
import { createNamespacedHelpers } from 'vuex'

const { mapActions: mapTableActions } = createNamespacedHelpers('table')

export default {
  name: 'FilterInput',
  components: {
    SearchBar
  },
  props: {
    reset: { type: Boolean, default: false }
  },
  data () {
    return {
      ageRange: {
        min: 0,
        max: 150
      },
      show: false,
      active: []
    }
  },
  computed: {
    number () {
      return [...Array(150).keys()]
    }
  },
  created: function () {
    this.$parent.$on('update', this.close)
  },
  watch: {
    ageRange: {
      deep: true,
      handler ({ min, max }) {
        this.updateTableFilter({ type: 'age', value: { min, max } })
      }
    },
    show () {
      this.$emit('whakapapa')
    }
  },
  methods: {
    ...mapTableActions(['updateTableFilter']),
    updateFilter ({ type, value }) {
      if (value && !this.active.includes(type)) this.active.push(type)
      else if (!value && this.active.includes(type)) this.active = this.active.filter(val => val !== type)
      this.updateTableFilter({ type, value })
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('whakapapaTable.' + key, vars)
    }
  }
}
</script>

<style lang="scss">

.pointer {
  cursor: pointer;
}

</style>
