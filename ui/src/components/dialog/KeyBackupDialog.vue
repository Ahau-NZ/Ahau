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
import { mapGetters, mapActions, createNamespacedHelpers } from 'vuex'
import Dialog from '@/components/dialog/Dialog.vue'
import { downloadKeys } from '@/lib/key-backup.js'
import { getGroupIds } from '@/lib/community-helpers.js'
import { getLatestSeq } from '@/lib/person-helpers.js'

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
    ...mapGetters(['whoami', 'notifications']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    examples () {
      if (this.mobile) return this.mobileItems
      return this.items
    }
  },
  methods: {
    ...mapSettingsActions(['updateSettings']),
    ...mapActions(['setWhoami']),
    async downloadKeys () {
      const groupIds = await this.getGroupIds()
      const latestMssgSeq = await this.getLatestSeq()

      downloadKeys(groupIds, latestMssgSeq)

      const input = {
        id: this.whoami.personal.settings.id,
        keyBackedUp: true
      }
      await this.updateSettings(input)

      await this.setWhoami()
    },
    async getGroupIds () {
      try {
        const res = await this.$apollo.query(
          getGroupIds
        )

        if (res.errors) throw res.errors

        return res.data.listGroups.map(d => d.id)
      } catch (err) {
        console.error(err)
        return null
      }
    },
    async getLatestSeq () {
      try {
        const res = await this.$apollo.query(
          getLatestSeq
        )

        if (res.errors) throw res.errors

        return res.data.latestSequence
      } catch (err) {
        console.error(err)
        return null
      }
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
