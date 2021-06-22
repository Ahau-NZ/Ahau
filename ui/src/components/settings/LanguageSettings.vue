<template>
  <v-row>
    <v-col cols="12" class="text-h5">
      {{ t('languageTitle') }}
    </v-col>
    <!-- <v-col cols="12"> -->
    <!--   {{ t('chooseLanguage') }} -->
    <!-- </v-col> -->
    <v-col cols="12" class="">
      <LocalePicker />
    </v-col>
    <v-col cols="12">
      <i>{{ t('languagesNote') }}</i>
      <br />
      <a
        href="http://chat.ahau.io"
        target="_blank"
        class="subtle-link"
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

<style scoped lang="scss">
.subtle-link {
  text-decoration: underline;
  transition: color 0.1s ease-in;
  &:hover {
    color: var(--v-accent-base);
  }
}
</style>
