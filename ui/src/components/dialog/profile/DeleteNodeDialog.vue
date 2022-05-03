<template>
  <Dialog :title="t('delete', { preferredName: profile.preferredName })" :show="show" width="720px" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <template v-slot:content>
      <v-card-subtitle>
        <v-col cols="12" sm="5" md="8">
          <v-radio-group v-model="removeProfile" column>
            <v-radio :label="t('hideProfile')" value="ignore"></v-radio>
            <v-radio :label="t('deleteProile')" value="delete"></v-radio>
          </v-radio-group>
        </v-col>
        <div class="warning-blurb">
          {{ confirmationMessage }}
          <span v-if="warnAboutChildren">
            {{ t('warnAboutChildren') }}
          </span>
        </div>
      </v-card-subtitle>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

const IGNORE = 'ignore'

export default {
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, required: true },
    warnAboutChildren: { type: Boolean, default: true }
  },
  components: {
    Dialog
  },
  data () {
    return {
      removeProfile: IGNORE
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    confirmationMessage () {
      if (this.removeProfile === IGNORE) return this.t('hideConfirmation')

      return this.t('deleteConfirmation')
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit', this.removeProfile)
      this.close()
    },
    t (key, vars) {
      return this.$t('deleteNode.' + key, vars)
    }
  }
}
</script>
