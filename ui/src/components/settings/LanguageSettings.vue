<template>
  <v-row>
    <v-col cols="12" class="text-h5">
      {{ t('languageTitle') }}
    </v-col>
    <v-col cols="12">
      {{ t('chooseLanguage') }}
    </v-col>
    <v-col cols="12" class="ml-5">
      <LocalePicker />
    </v-col>
    <v-col cols="12">
      {{ t('languagesNote') }}
      <a
        href="http://chat.ahau.io"
        target="_blank"
        class="font-weight-bold"
      >
        {{ t('submitFeedback') }}
      </a>
    </v-col>
  </v-row>
</template>

<script>
import LocalePicker from '@/components/LocalePicker.vue'

export default {
  name: 'LanguageSettings',
  components: {
    LocalePicker
  },
  methods: {
    t (key, vars) {
      return this.$t('settingsForm.' + key, vars)
    }
  }
}
</script>
