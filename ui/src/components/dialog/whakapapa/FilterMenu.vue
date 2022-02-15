<template>
  <transition appear name="right">
    <v-navigation-drawer
      :style="mobile ? 'top: 0px;' : 'top: 64px;'"
      :absolute="mobile"
      :fixed="!mobile"
      :right="!mobile"
      light
      permanent
      :width="navWidth"
      :height="mobile ? '100%' : 'calc(100vh - 64px)'"
      class="side-menu"
      :bottom="mobile"
    >
      <v-card light height="90%" class="text-center" flat>
        <v-container v-if="isTable" class="black--text">
          <v-row class="justify-end">
            <v-btn icon class="mr-3">
              <v-icon @click="close" color="secondary">mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-col cols="12 overline" align="start" class="mt-n10 mb-2">
            <h1>{{ t('applyTableFilters') }}</h1>
          </v-col>
          <FilterInput :reset="resetData" @whakapapa="toggleWhakapapa()"/>
          <SortInput :reset="resetData"  @whakapapa="toggleWhakapapa()"/>
          <OptionsInput :reset="resetData"/>

          <!-- Hide Deceased -->
          <v-list-item class="py-4">
            <v-list-item-content>
              <v-list-item-title align="start" v-text="'Hide deceased'" />
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="hideDeceased"/>
            </v-list-item-action>
          </v-list-item>

          <!-- Hide WhakapapaLinks -->
          <v-list-item class="pb-4">
            <v-list-item-content>
              <v-list-item-title align="start" v-text="'Show whakapapa'"/>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="showWhakapapa" />
            </v-list-item-action>
          </v-list-item>

          <v-row>
            <v-col cols="12" class="mt-10">
              <v-btn @click="close" text large color="blue" :class="mobile ? 'mr-10': 'pr-10'">
                {{ t('apply') }}
              </v-btn>
              <v-btn @click="reset" text large color="red" :class="mobile ? 'ml-10':'pl-5'">
                {{ t('clear') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
        <v-container v-else class="black--text">
          <v-row class="justify-end">
            <v-btn icon class="mr-3">
              <v-icon @click="close" color="secondary">mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-col cols="12 overline" align="start" class="mt-n10 mb-2">
            <h1>{{ t('applyTableFilters') }}</h1>
          </v-col>
          <!-- Toggle names only -->
          <v-list-item class="py-4">
            <v-list-item-content>
              <v-list-item-title align="start" v-text="t('avatars')" />
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="showAvatars"/>
            </v-list-item-action>
          </v-list-item>

          <!-- show partners and parents -->
          <v-list-item class="pb-4">
            <v-list-item-content>
              <v-list-item-title align="start" v-text=" t('parents')"/>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="extendedFamily" />
            </v-list-item-action>
          </v-list-item>

          <v-row>
            <v-col cols="12" class="mt-10">
              <v-btn @click="resetTree" text large color="red" :class="mobile ? 'ml-10':'pl-5'">
                {{ t('default') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-navigation-drawer>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import FilterInput from '@/components/dialog/whakapapa/FilterInput.vue'
import SortInput from './SortInput.vue'
import OptionsInput from './OptionsInput.vue'

export default {
  name: 'FilterMenu',
  components: {
    FilterInput,
    SortInput,
    OptionsInput
  },
  props: {
    show: { type: Boolean, default: false },
    isTable: { type: Boolean, default: false }
  },
  data () {
    return {
      resetData: false,
      hideDeceased: false, // hides all deceased nodes
      showWhakapapa: false,
      showAvatars: true,
      extendedFamily: false
    }
  },
  watch: {
    show (newVal) {
      if (newVal) this.resetData = false
    },
    hideDeceased (value) {
      this.updateTableFilter({ type: 'deceased', value })
    },
    showWhakapapa () {
      this.hideDeceased = false
      this.toggleTableFlatten()
    },
    showAvatars () {
      this.$emit('toggleAvatars')
    },
    extendedFamily (val) {
      this.setExtendedFamily(val)
    },
    showExtendedFamily (val) {
      this.extendedFamily = val
    }
  },
  computed: {
    ...mapGetters('table', ['tableFlatten', 'tableFilter']),
    ...mapGetters('whakapapa', ['showExtendedFamily']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    navWidth () {
      if (!this.show) return '0px'
      else if (this.mobile) return '100%'
      return '21%'
    }
  },
  methods: {
    ...mapActions('whakapapa', ['setExtendedFamily']),
    ...mapActions('table', ['toggleTableFlatten', 'resetTableFilters', 'updateTableFilter']),
    toggleWhakapapa () {
      if (this.whakapapa) this.whakapapa = false
    },
    close () {
      this.$emit('close')
    },
    reset () {
      this.resetData = true
      this.resetTableFilters()
      this.close()
    },
    resetTree () {
      this.showAvatars = true
      this.setExtendedFamily(true)
      this.close()
    },
    t (key, vars) {
      return this.$t('whakapapaTable.' + key, vars)
    }
  }
}
</script>
