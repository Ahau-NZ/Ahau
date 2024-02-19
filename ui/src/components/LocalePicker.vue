<template>
  <v-select
    :value="locale"
    :items="locales"
    @change="handleChange"
    light
    dense
    hide-details
    outlined
    class="LocalePicker"
    :menuProps="{ light: true }"
  />
</template>

<script>
function getVuetifyLocale (locale) {
  return locale.split('_')[0]
}

export default {
  computed: {
    locale: {
      get () {
        return this.$i18n.locale || 'en_NZ'
      },
      set (val) {
        this.$i18n.locale = val
        localStorage.setItem('locale', val)

        this.$vuetify.lang.current = getVuetifyLocale(val)
        // TODO mix 2021-04-14 vuetify i18n integrations
        // may not be needed but if we need to customise component translations check this out:
        // https://dev.vuetifyjs.com/en/features/internationalization/#vue-i18n
      }
    },
    locales () {
      return this.$i18n.availableLocales.map(locale => {
        switch (locale) {
          case 'en_NZ': return { text: 'English (NZ)', value: locale }
          case 'en_US': return { text: 'English (US)', value: locale }
          case 'es_ES': return { text: 'Español', value: locale }
          case 'nl_NL': return { text: 'Nederlandse (NL)', value: locale }
          case 'pt_BR': return { text: 'Português (BR)', value: locale }
          case 'mi_NZ': return { text: 'Te Reo Māori', value: locale }

          // handle display of old "en" value
          case 'en': return { text: 'English (NZ)', value: 'en_NZ' }

          default: return { text: locale, value: locale }
        }
      })
    }
  },
  created () {
    this.$vuetify.lang.current = getVuetifyLocale(this.locale)
  },
  methods: {
    handleChange (locale) {
      this.locale = locale
    }
  }
}
</script>

<style scoped lang="scss">
.LocalePicker {
  margin: 0;
  padding: 0;
  max-width: 200px;
  font-size: 14px;
  letter-spacing: 1px;
}
</style>
