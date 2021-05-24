<template>
  <Dialog :title="t('settingsTitle')" :show="show" @close="close" width="700px" :goBack="close" hide-actions>
    <template v-slot:content>
      <v-container fluid>
        <LanguageSettings />
        <StorageSettings />

        <v-card-text class="pt-4">
          <h3>{{ t('keyBackupTitle') }}</h3>
          <p>
            {{ t('loseAccess') }}.
            {{ t('backUpKey') }}
          </p>
          <v-col style="margin-bottom:20px" align="left" class="py-0 pl-0">
            <v-btn
              class="white--text"
              color="black"
              @click.prevent="downloadKeys"
            >
              {{ t('downloadKey') }}
            </v-btn>
          </v-col>
        </v-card-text>
      </v-container>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

import LanguageSettings from '@/components/settings/LanguageSettings.vue'
import StorageSettings from '@/components/settings/StorageSettings.vue'

import { createNamespacedHelpers } from 'vuex'
import { downloadBackup } from '@/lib/download-helper'

const { mapActions: mapSettingsActions } = createNamespacedHelpers('settings')

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'SettingsDialog',
  components: {
    Dialog,
    LanguageSettings,
    StorageSettings
  },
  methods: {
    ...mapSettingsActions(['getBackup', 'updateKeyBackupSettings']),
    async downloadKeys () {
      const backupContent = await this.getBackup()

      downloadBackup(backupContent)

      await this.updateKeyBackupSettings(true)
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('settingsForm.' + key, vars)
    }
  }
}
</script>
<style scoped lang="scss">

</style>
