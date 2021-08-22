<template>
  <div>
    <v-divider />
      <v-row @click="show = !show" class="pointer">
        <v-col align="start">
          <v-row class="pl-2">
            <v-icon :class="sortActive ? 'blue--text':''" small >mdi-sort</v-icon>
            <span :class="sortActive ? 'blue--text':''" class="pa-0 ma-0 pl-2">{{ t('sort') }}:</span>
            <div v-if="sortActive">
              <span style="font-size:smaller" class="blue--text pa-0 ma-0 pl-2">{{ value }} {{ sign[index] }}</span>
            </div>
          </v-row>
        </v-col>
        <v-btn icon right>
          <v-icon class="pt-3">{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-row>
    <v-expand-transition>
      <div v-show="show">
        <v-list>
          <v-list-item-group v-model="model">
            <v-list-item
              v-for="(item, i) in items"
              :key="i"
              :value="item.value"
              @click="updateSort({value: item.value, event: $event})"
            >
              <v-list-item-content>
                <v-list-item-title style="font-size: smaller" v-text="item.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const { mapActions: mapTableActions, mapGetters: mapTableGetters } = createNamespacedHelpers('table')

export default {
  name: 'SortInput',
  props: {
    reset: Boolean
  },
  data () {
    return {
      items: [
        { text: this.t('generation'), value: '' },
        { text: this.t('name'), value: 'preferredName' },
        { text: this.t('fullName'), value: 'legalName' },
        { text: this.t('age'), value: 'age' },
        { text: this.t('profession'), value: 'profession' },
        { text: this.t('country'), value: 'country' }
      ],
      model: 0,
      show: false,
      sign: ['↑', '↓'],
      value: null,
      index: 0,
      sortActive: false
    }
  },
  watch: {
    reset () {
      this.resetSort()
    },
    show () {
      this.$emit('whakapapa')
    }
  },
  computed: {
    ...mapTableGetters(['tableSort']),
    number () {
      return [...Array(150).keys()]
    }
  },
  methods: {
    ...mapTableActions(['updateTableSort']),

    // Identify sort and ascending/descending
    updateSort ({ value, event }) {
      if (value === '') return this.resetSort()
      if (this.value === value) this.index++
      else (this.index = 0)
      this.value = value
      this.sortActive = true
      if (this.index === 2) {
        this.resetSort()
      }
      this.updateTableSort({ value, event })
    },
    resetSort () {
      this.updateTableSort({ value: '', event: '' })
      this.index = 0
      this.sortActive = false
      this.value = ''
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
