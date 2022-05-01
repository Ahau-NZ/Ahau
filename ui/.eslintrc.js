const isTimeToFix = Date.now() > Number(new Date('2022-05-05'))
const warnForNow = isTimeToFix ? 'error' : 'warn'
const offForNow = isTimeToFix ? 'error' : 'off'

module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
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

    'vue/multi-word-component-names': offForNow,

    // these are pretty important
    'vue/no-mutating-props': warnForNow,
    'vue/no-computed-properties-in-data': warnForNow
  }
}
