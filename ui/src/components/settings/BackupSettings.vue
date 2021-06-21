<template>
  <v-row>
    <v-col cols="12" class="text-h5">
      {{ t('keyBackupTitle') }}
    </v-col>
    <v-col>
      {{ t('loseAccess') }}.
      {{ t('backUpKey') }}
    </v-col>
    <v-col cols="12" class="ml-5">
      <v-btn
        class="white--text"
        color="black"
        @click.prevent="downloadKeys"
      >
        {{ t('downloadKey') }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { downloadBackup } from '@/lib/download-helper'

const { mapActions: mapSettingsActions } = createNamespacedHelpers('settings')

export default {
  name: 'BackupSettings',
  methods: {
    ...mapSettingsActions(['getBackup', 'updateKeyBackupSettings']),
    async downloadKeys () {
      const backupContent = await this.getBackup()

      downloadBackup(backupContent)

      await this.updateKeyBackupSettings(true)
    },
    t (key, vars) {
      return this.$t('settingsForm.' + key, vars)
    }
  }
}
</script>
