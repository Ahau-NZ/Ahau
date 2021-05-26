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
        return this.$i18n.locale
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
          case 'en': return { text: 'English', value: locale }
          case 'mi_NZ': return { text: 'Māori', value: locale }
          case 'pt_BR': return { text: 'Portugeuse (BR)', value: locale }
          default: return { text: locale, value: locale }
        }
      })
    }
  },
  created () {
    // try to be smart when picking the default language

    const browserLang = navigator.languages.find((lang) =>
      this.$i18n.availableLocales.includes(lang)
    )

    // default to what the user had last time, if anything
    // otherwise get a language that the browser says the user prefers
    // if we don't have a language like that, fall back to english
    this.locale = localStorage.getItem('locale') || browserLang || 'en'
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
  max-width: 140px;
  font-size: 14px;
  letter-spacing: 1px;
}
</style>
