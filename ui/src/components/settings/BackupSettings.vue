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
import { mapGetters, mapActions, createNamespacedHelpers } from 'vuex'
import { downloadKeys } from '@/lib/key-backup.js'

const { mapActions: mapSettingsActions } = createNamespacedHelpers('settings')
const { mapActions: mapTribeActions } = createNamespacedHelpers('tribe')

export default {
  name: 'BackupSettings',
  computed: {
    ...mapGetters(['whoami'])
  },
  methods: {
    ...mapSettingsActions(['updateSettings', 'getLatestSeq']),
    ...mapTribeActions(['getTribeIds']),
    ...mapActions(['setWhoami']),
    async downloadKeys () {
      const groupIds = await this.getTribeIds()
      const latestMssgSeq = await this.getLatestSeq()

      downloadKeys(groupIds, latestMssgSeq)

      const input = {
        id: this.whoami.personal.settings.id,
        keyBackedUp: true
      }
      await this.updateSettings(input)

      await this.setWhoami()
    },
    t (key, vars) {
      return this.$t('settingsForm.' + key, vars)
    }
  }
}
</script>
