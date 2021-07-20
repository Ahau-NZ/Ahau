<template>
  <v-container fluid>
    <LanguageSettings />
    <v-divider />
    <BackupSettings />
    <v-divider />
    <template v-if="showStorageSettings">
      <StorageSettings />
      <v-divider />
    </template>
    <v-col align="left" class="pb-10">
      <v-btn
        class="white--text"
        color="secondary"
        @click.prevent="$emit('openDeleteProfile')"
      >
        {{ t('deleteProfile') }}
      </v-btn>
    </v-col>
  </v-container>
</template>

<script>
import { isCordova } from '@/lib/cordova-helpers'

import LanguageSettings from '@/components/settings/LanguageSettings.vue'
import StorageSettings from '@/components/settings/StorageSettings.vue'
import BackupSettings from '@/components/settings/BackupSettings.vue'

export default {
  name: 'SettingsDialog',
  data () {
    return {
      showStorageSettings: true
    }
  },
  components: {
    BackupSettings,
    LanguageSettings,
    StorageSettings
  },
  mounted () {
    this.showStorageSettings = !isCordova()
  },
  methods: {
    t (key, vars) {
      return this.$t('settingsForm.' + key, vars)
    }
  }
}
</script>

<style scoped lang="scss">

// v-divider
hr {
  margin-bottom: 20px;
}
</style>
