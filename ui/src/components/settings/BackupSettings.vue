<template>
  <v-row>
    <v-col cols="12" class="text-h5">
      {{ t('keyBackupTitle') }}
    </v-col>
    <v-col cols="12" class="">
      <v-btn
        class="white--text"
        color="black"
        @click.prevent="downloadKeys"
      >
        {{ t('downloadKey') }}
      </v-btn>
    </v-col>
    <v-col>
      <i>
        {{ t('loseAccess') }}.
        {{ t('backUpKey') }}
      </i>
    </v-col>
  </v-row>
</template>

<script>
import { mapActions } from 'vuex'
import { downloadBackup } from '@/lib/download-helper'

export default {
  name: 'BackupSettings',
  methods: {
    ...mapActions('settings', ['getBackup', 'updateKeyBackupSettings']),
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
