<template>
  <Dialog :title="t('settingsTitle')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <h3>{{ t('languageTitle') }}</h3>
        <p>
          {{ t('chooseLanguage') }}
        </p>
        <LocalePicker class='locale' />
        <p>
          {{ t('languagesNote') }}
          <a href="http://chat.ahau.io" target="_blank">{{ t('submitFeedback') }}</a>
        </p>
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
