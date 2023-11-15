require('@rushstack/eslint-patch/modern-module-resolution')

const isTimeToFix = Date.now() > Number(new Date('2024-01-01'))
const warnForNow = isTimeToFix ? 'error' : 'warn'

module.exports = {
  root: true,
  env: {
    es2022: true
  },
  parserOptions: {
    requireConfigFile: false // rm?
  },
  extends: [
    'plugin:vue/essential',
    '@vue/eslint-config-standard'
  ],
  rules: {
    // these are pretty important
    'vue/no-mutating-props': warnForNow,

    // needed for v-data-table slots
    // > Some slots such as item.<name> and header.<name> use modifiers to target more scoped slots.
    // > Eslint by default will throw errors when slots use modifiers.
    'vue/valid-v-slot': ['error', { allowModifiers: true }]
  }
}
