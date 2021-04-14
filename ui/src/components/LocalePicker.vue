<template>
  <v-select
    :value="locale"
    :items="locales"
    @focus="handleFocus"
    @click="handleFocus"
    @blur="isFocused = false"
    @change="handleChange"

    dark
    dense
    hide-details
    outlined
    :class="{ LocalePicker: true, '-focused': isFocused }"
  />
</template>

<script>

export default {
  data () {
    return {
      isFocused: false
    }
  },
  computed: {
    locale: {
      get () {
        return this.$i18n.locale
      },
      set (val) {
        // TODO mix 2021-04-14 investigate to see if Vuetify needs something similar

        // setting quasar's language as well to get e.g. localized calendars
        // https://quasar.dev/options/quasar-language-packs#Change-Quasar-Language-Pack-at-Runtime
        // switching en with en-us since quasar doesn't have plain en
        // const qLang = val === 'en' ? 'en-us' : val
        // import(
        //   /* webpackInclude: /(en-us|es)\.js$/ */
        //   `quasar/lang/${qLang}`
        // )
        //   .then((lang) => {
        //     this.$q.lang.set(lang.default)
        //   })
        //   .catch((err) =>
        //     console.error("Couldn't import quasar language:", err)
        //   )

        this.$i18n.locale = val
        localStorage.setItem('locale', val)
      }
    },
    locales () {
      if (!this.isFocused) {
        return this.$i18n.availableLocales.map(locale => {
          switch (locale) {
            case 'en': return { text: 'EN', value: locale }
            case 'mi_NZ': return { text: 'MI', value: locale }
            case 'pt_BR': return { text: 'PT', value: locale }
            default: return { text: locale, value: locale }
          }
        })
      }

      return this.$i18n.availableLocales.map(locale => {
        switch (locale) {
          case 'en': return { text: 'English', value: locale }
          case 'mi_NZ': return { text: 'Te reo', value: locale }
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
  },
  methods: {
    handleChange (locale) {
      this.isFocused = false
      this.locale = locale
    },
    handleFocus () {
      this.isFocused = true
    }
  }
}
</script>

<style scoped lang="scss">
.LocalePicker {
  margin: 0;
  padding: 0;
  max-width: 80px;

  // text-transform: uppercase;
  // font-weight: 800;
  font-size: 14px;
  letter-spacing: 1px;

  &.-focused {
    max-width: 140px;
  }
}
</style>
