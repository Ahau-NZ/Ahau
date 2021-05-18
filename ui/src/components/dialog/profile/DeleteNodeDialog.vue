<template>
  <Dialog :title="t('delete', { preferredName: profile.preferredName })" :show="show" width="720px" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >
    <template v-slot:content>
      <v-card-subtitle>
        <v-col cols="12" sm="5" md="8">
          <v-radio-group v-model="removeProfile" column>
            <v-radio :label="$t('deleteNode.hideProfile')" value="ignore"></v-radio>
            <v-radio :label="$t('deleteNode.deleteProile')" value="delete"></v-radio>
          </v-radio-group>
        </v-col>
        <div v-show="removeProfile == 'delete' " class="warning-blurb">
          {{ $t('deleteNode.confirmationMessage') }}
          <span v-if="warnAboutChildren">
            {{ $t('deleteNode.warnAboutChildren') }}
        </span>
        </div>
        <div v-show="removeProfile == 'ignore' " class="warning-blurb">
            {{ $t('deleteNode.confirmationMessage') }}
          <span v-if="warnAboutChildren">
             {{ $t('deleteNode.warnAboutChildren') }}
        </span>
        </div>

      </v-card-subtitle>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true },
    profile: { type: Object, required: true },
    warnAboutChildren: { type: Boolean, default: true }
  },
  data () {
    return {
      removeProfile: 'ignore'
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    height () {
      if (this.mobile) {
        return 'calc(100vh - 50px)'
      } else return 'auto'
    },
    warningVisibility () {
      if (!this.warnAboutChildren) return { visibility: 'hidden' }
      if (this.removeProfile === 'ignore') return { visibility: 'hidden' }

      return { }
    }
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    submit () {
      this.$emit('submit', this.removeProfile)
      this.close()
    }
  },
  components: {
    Dialog
  },
    t (key, vars) {
      return this.$t('deleteNode.' + key, vars)
    }
}
</script>
