<template>
  <Dialog :title="t('settingsTitle')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
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
        <h3 class="pt-6">{{ t('languageTitle') }}</h3>
        <p>
          {{ t('chooseLanguage') }}
        </p>
        <LocalePicker class='locale' />
        <p>
          {{ t('languagesNote') }}
          <a href="http://chat.ahau.io" target="_blank">{{ t('submitFeedback') }}</a>
        </p>
        <v-col style="margin-bottom:20px" align="left" class="py-0">
          <v-btn
            class="white--text"
            color="black"
            @click.prevent="$emit('showDeleteProfile')"
          >
            {{ t('deleteProfile') }}
          </v-btn>
        </v-col>
      </v-card-text>
    </template>
    <template v-slot:actions>
      <v-col align="center" class="py-0">
      </v-col>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import LocalePicker from '@/components/LocalePicker'

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
    LocalePicker
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
.locale {
    margin-bottom:20px;
  }
</style>
