<template>
  <Dialog :title="t('title')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <p>{{ t('whyBackUp') }}</p>
        <p>
          <ul>
            <li>{{ t('allInformation') }}</li>
            <li>{{ t('noAccess') }}</li>
          </ul>
        </p>
        <p>
          {{ t('yourAhauKey') }}
        </p>
        <p>
          {{ t('recommendations') }}
        </p>
        <ol>
          <li>{{ t('personal') }}</li>
          <li>{{ t('trustedPerson') }}</li>
          <li>{{ t('printFile') }}</li>
        </ol>
      </v-card-text>
    </template>
    <template v-slot:actions>
      <v-col align="center" class="py-0">
        <v-btn
          class="white--text my-3"
          color="black"
          @click.prevent="downloadKeys"
        >
          {{ t('downloadButton') }}
        </v-btn>
      </v-col>
    </template>
  </Dialog>
</template>

<script>
import { mapGetters, createNamespacedHelpers } from 'vuex'
import Dialog from '@/components/dialog/Dialog.vue'
import { downloadBackup } from '@/lib/download-helper'

const { mapActions: mapSettingsActions } = createNamespacedHelpers('settings')

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'KeyBackupDialog',
  components: {
    Dialog
  },
  computed: {
    ...mapGetters(['whoami', 'notifications'])
  },
  methods: {
    ...mapSettingsActions(['getBackup', 'updateKeyBackupSettings']),
    async downloadKeys () {
      const backupContent = await this.getBackup()

      downloadBackup(backupContent)

      await this.updateKeyBackupSettings(true)
    },
    t (key, vars) {
      return this.$t('keyBackupForm.' + key, vars)
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>
<style scoped>
v-btn {
  height:100px;
}
.dwn-btn {
  background-color: black;
  color: white;
}
.text-centre {
  height: 700px;
}
</style>
