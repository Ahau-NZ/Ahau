// HACK ///////////////////
//   Vuetify + Storybook is  a pain. This ugly solution works...
//   https://github.com/storybookjs/storybook/issues/7593#issuecomment-548146120

const path = require('path')

module.exports = async ({ config, mode }) => {
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.s(c|a)ss$/,
      use: [
        'vue-style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            implementation: require('sass'),
            sassOptions: {
              fiber: require('fibers'),
              indentedSyntax: true
            }
          }
        }
      ]
    }
  ]

  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src')
  }

  return config
}
