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
        <p>
          {{ t('continue') }}
        </p>
      </v-card-text>
    </template>
    <template v-slot:actions>
        <v-btn
          class="white--text my-3"
          style="margin-right: 20px"
          color="black"
          @click.prevent="deleteProfile"
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
      keepProfileVisible: false
    }
  },
  methods: {
    async deleteProfile () {
      const addAuthors = {
        // add: ['*'],
        remove: ['*']
      }

      console.log('change authors to *: ', addAuthors)
      const input = { id: this.profile.id, authors: addAuthors }
      await this.saveProfile(input)
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
