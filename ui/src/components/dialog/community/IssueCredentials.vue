<template>
  <div class="ma-2">
    <!-- title -->
    <v-col class="py-0 font-italic">
      {{ t('issueCredentialsDescription') }}
    </v-col>
    <v-col cols="12" class="pl-5 py-0">
      <v-row v-for="(setting, i) in credentialSettings" :key="i" class="py-0">
        <v-switch
          v-model="setting.value"
          :label="setting.label(setting.value)"
          color="blue"
          class="py-0 switch"
          hide-details
          @change="emitChanges(setting.key, setting.value)"
        ></v-switch>
        <v-spacer v-if="!mobile" class="py-0"/>
      </v-row>
    </v-col>
  </div>
</template>
<script>

export default {
  name: 'IssueCredentails',
  props: {
    settings: Object
  },
  data () {
    return {
      credentialSettings: [
        {
          key: 'issuesVerifiedCredentials',
          label: d => this.t('issueCredentialsToggle', { toggle: this.getSwitchLabel(d) }),
          value: this.settings.issuesVerifiedCredentials
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
