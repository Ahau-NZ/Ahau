<template>
  <Dialog :title="t('settingsTitle')" :show="show" @close="close" width="700px" :goBack="close" hide-actions>
    <template v-slot:content>
      <v-container fluid>
        <LanguageSettings />
        <v-divider />
        <BackupSettings />
        <v-divider />
        <StorageSettings />
        <v-divider />
        <v-col align="left" class="pb-10">
          <v-btn
            class="white--text"
            color="black"
            @click.prevent="$emit('showDeleteProfile')"
          >
            {{ t('deleteProfile') }}
          </v-btn>
        </v-col>
      </v-container>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

import LanguageSettings from '@/components/settings/LanguageSettings.vue'
import StorageSettings from '@/components/settings/StorageSettings.vue'
import BackupSettings from '@/components/settings/BackupSettings.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'SettingsDialog',
  components: {
    Dialog,
    BackupSettings,
    LanguageSettings,
    StorageSettings
  },
  methods: {
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

// v-divider
hr {
  margin-bottom: 20px;
}
</style>
