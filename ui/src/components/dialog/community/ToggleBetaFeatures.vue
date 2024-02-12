<template>
  <v-row>
    <v-col cols="12" class="overline py-0 pl-6">
      {{ t('betaFeatures') }}
    </v-col>
    <v-col cols="12" class="py-0 pl-8">
      <v-switch
        v-model="toggled"
        :label="label"
        color="blue"
        class="py-0 switch"
        hide-details
        disabled
        @change="setBetaFeaturesEnabled"
      ></v-switch>
      <v-expand-transition>
          <div v-if="betaFeaturesEnabled">
            <slot />
          </div>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ToggleBetaFeatures',
  props: {
    enabled: Boolean
  },
  data () {
    return {
      toggled: null
    }
  },
  watch: {
    betaFeaturesEnabled: {
      immediate: true,
      handler (enabled) {
        this.toggled = false // TODO: = enabled
      }
    }
  },
  computed: {
    ...mapGetters('tribe', ['tribeSettings', 'betaFeaturesEnabled']),
    isOneSettingEnabled () {
      // return this.tribeSettings.issuesVerifiedCredentials || this.tribeSettings.acceptsVerifiedCredentials
      return false
    },
    label () {
      return this.betaFeaturesEnabled
        ? this.t('label.on')
        : this.t('label.off')
    }
  },
  methods: {
    ...mapActions('tribe', ['setBetaFeaturesEnabled']),
    t (key, vars) {
      return this.$t('toggleBetaSettings.' + key, vars)
    }
  }
}
</script>
<style scoped>
.switch ::v-deep .v-label {
  font-size: 0.9rem
}
</style>
