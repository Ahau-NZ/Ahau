require('@rushstack/eslint-patch/modern-module-resolution')

const isTimeToFix = Date.now() > Number(new Date('2023-10-01'))
const warnForNow = isTimeToFix ? 'error' : 'warn'
const offForNow = isTimeToFix ? 'error' : 'off'

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
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-useless-catch': 'warn',

    'object-curly-newline': 'error',
    'prefer-const': 'error',
    'quote-props': 'error',
    'array-bracket-spacing': 'warn',
    'dot-notation': 'warn',
    'no-multiple-empty-lines': 'warn',

    'vue/multi-word-component-names': offForNow,
    'vue/no-reserved-component-names': offForNow,

    // these are pretty important
    'vue/no-mutating-props': warnForNow,
    'vue/no-computed-properties-in-data': warnForNow,
    'vue/no-v-text-v-html-on-component': warnForNow,

    // needed for v-data-table slots
    // > Some slots such as item.<name> and header.<name> use modifiers to target more scoped slots.
    // > Eslint by default will throw errors when slots use modifiers.
    // > To disable these errors, add the following rule to your eslint configuration:
    'vue/valid-v-slot': ['error', { allowModifiers: true }]
  }
}
