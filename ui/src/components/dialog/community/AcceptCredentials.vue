<template>
  <div class="ma-2 mt-4">
    <!-- title -->
    <div class="pl-4 black--text">
      <p class="overline">{{ t('addAcceptCredTitle') }}</p>
      <p>{{ t('verifiedCredentialsOffHelpText') }}</p>
    </div>
    <v-col cols="12" class="pl-5">
      <v-row v-for="(setting, i) in credentialSettings" :key="i" class="py-0">
        <v-col class="py-0">
          <v-switch
            v-model="setting.value"
            :label="setting.label(setting.value)"
            color="blue"
            class="py-0 switch"
            hide-details
            @change="emitChanges(setting.key, setting.value)"
          ></v-switch>
        </v-col>
        <v-spacer v-if="!mobile" class="py-0"/>
      </v-row>
    </v-col>
  </div>
</template>
<script>

export default {
  name: 'AcceptCredentials',
  props: {
    settings: Object
  },
  data () {
    return {
      credentialSettings: [
        {
          key: 'acceptsVerifiedCredentials',
          label: d => this.t('acceptsVerifiedCredentials', { toggle: this.getSwitchLabel(d) }),
          value: this.settings.acceptsVerifiedCredentials
        }
      ]
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    getSwitchLabel (val) {
      return val === true ? this.t('on') : this.t('off')
    },
    t (key, vars) {
      return this.$t('tribeSettings.' + key, vars)
    },
    emitChanges (key, value) {
      this.$emit('change', { key, value })
    }
  }
}

</script>
<style scoped>
.switch ::v-deep .v-label {
  font-size: 0.9rem
}
</style>
