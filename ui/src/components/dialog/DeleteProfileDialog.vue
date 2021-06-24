<template>
  <Dialog :title="t('title')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <p>
          <b>{{ t('warning') }}</b>{{ t('undone') }}
        </p>
        <p>
          {{ t('notBackedUp') }}
        </p>
      </v-card-text>
      <v-card-text class="pt-4" style="text-align:center">
        <p>
          {{ t('confirmDeletePrompt') }}
        </p>
        <p>
          <b>{{ t('deletePhrase') }}</b>
        </p>
      </v-card-text>
      <v-text-field
        v-model="confirmDeleteIput"
        outlined
      />
    </template>
    <template v-slot:actions>
        <v-btn
          class="white--text my-3"
          style="margin-right: 20px"
          color="black"
          @click.prevent="deleteProfile"
          :disabled="!userInputMatches"
        >
          {{ t('deleteButton') }}
        </v-btn>
        <v-btn
          class="black--text my-3"
          style="margin-right: 20px"
          color="white"
          @click.prevent="cancel"
        >
          {{ t('cancelButton') }}
        </v-btn>
    </template>
  </Dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import Dialog from '@/components/dialog/Dialog.vue'
import mapProfileMixins from '@/mixins/profile-mixins.js'

export default {
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, required: true }
  },
  name: 'KeyBackupDialog',
  mixins: [
    mapProfileMixins({
      mapMethods: ['saveProfile']
    })
  ],
  components: {
    Dialog
  },
  data () {
    return {
      removeProfile: false,
      keepProfileVisible: false,
      confirmDeleteIput: ''
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    userInputMatches () {
      return this.confirmDeleteIput === this.t('deletePhrase')
    }
  },
  methods: {
    async deleteProfile () {
      const authors = {
        add: ['*']
      }

      const input = { id: this.profile.id, authors }
      await this.saveProfile(input)

      const tombstone = {
        date: Date.now(),
        reason: 'User deleted profile'
      }

      const tombstoneInput = {
        id: this.whoami.public.profile.id,
        tombstone,
        allowPublic: true
      }

      await this.saveProfile(tombstoneInput)
    },
    cancel () {
      this.$emit('cancel')
    },
    t (key, vars) {
      return this.$t('deleteProfileForm.' + key, vars)
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
  margin-right: 20px;
}
</style>
