<template>
  <transition appear name="right">
    <v-navigation-drawer
      :style="mobile ? 'top: 0px;' : 'top: 64px;'"
      absolute
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

        <!-- Table -->
        <v-container v-if="isTable || isList" class="black--text">
          <v-row class="justify-end">
            <v-btn icon class="mr-3">
              <v-icon @click="close" color="secondary">mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-col cols="12 overline" align="start" class="mt-n10 mb-2">
            <h1>{{ t('settings') }}</h1>
          </v-col>
          <FilterInput :reset="resetData" @toggleShow="toggleWhakapapa()"/>
          <SortInput v-if="!isList" :reset="resetData"  @whakapapa="toggleWhakapapa()"/>
          <OptionsInput :reset="resetData" :isList="isList" :headers.sync="headers" :activeHeaders="activeHeaders" />

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
          <!--
            TODO 2022-07-11 (mix) re-enable
              this was disabled in order to get faster graph drawing merged. The data needed to draw this
              nested was lost during refactoring. Was decided search/ filter/ export were most important and to
              keep moving

          <v-list-item v-if="!isList" class="pb-4">
            <v-list-item-content>
              <v-list-item-title align="start" v-text="'Show whakapapa'"/>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model="showWhakapapa" />
            </v-list-item-action>
          </v-list-item>
          -->

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

        <!-- Tree -->
        <v-container v-else class="black--text">
          <v-row class="justify-end">
            <v-btn icon class="mr-3">
              <v-icon @click="close" color="secondary">mdi-close</v-icon>
            </v-btn>
          </v-row>
          <v-col cols="12 overline" align="start" class="mt-n10 mb-2">
            <h1>{{ t('settings') }}</h1>
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
              <v-switch :value="showExtendedFamily" @change="setExtendedFamily($event)" />
            </v-list-item-action>
          </v-list-item>

          <v-list-item class="pb-4">
            <v-list-item-content>
              <v-list-item-title align="start" v-text=" t('autoCollapse')"/>
            </v-list-item-content>
            <v-list-item-action>
              <v-switch v-model='autoCollapse' @change='toggleAutoCollapse($event)' :disabled="autoCollapse"/>
            </v-list-item-action>
          </v-list-item>

          <v-row>
            <v-col cols="12" class="mt-10">
              <v-btn outlined @click="resetTree" text large color="red" :class="mobile ? 'ml-10':'pl-5'">
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
    show: Boolean,
    isTable: Boolean,
    isList: Boolean,
    headers: Array,
    activeHeaders: Array
  },
  data () {
    return {
      resetData: false,
      hideDeceased: false, // hides all deceased nodes
      showWhakapapa: false,

      showAvatars: true,
      autoCollapse: false,
      showExtendedFamily: false
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
    }
  },
  computed: {
    ...mapGetters('table', ['tableFlatten', 'tableFilter']),
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
    ...mapActions('whakapapa', ['setExtendedFamily', 'setAutoCollapse']),
    ...mapActions('table', ['toggleTableFlatten', 'resetTableFilters', 'updateTableFilter']),
    toggleWhakapapa () {
      if (this.whakapapa) this.whakapapa = false
    },
    toggleAutoCollapse (e) {
      this.setAutoCollapse(!e)
      this.close()
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
