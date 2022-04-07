const dotenv = require('dotenv')
const webpack = require('webpack')
const { join } = require('path')

const env = dotenv.config({ path: join(__dirname, '.env') })

if (env.error) {
  if (env.error.message.match(/no such file or directory/)) {
    if (process.env.NODE_ENV === 'production') throw env.error
    else console.log('No ui/.env file found, please set one up')
  } else {
    throw env.error
  }
} else {
  process.env.VUE_APP_MIXPANEL_TOKEN = env.parsed.MIXPANEL_TOKEN
  process.env.VUE_APP_MIXPANEL_API_HOST = env.parsed.MIXPANEL_API_HOST
}

process.env.VUE_APP_PLATFORM = process.env.PLATFORM === 'cordova'
  ? 'cordova'
  : 'web'

const publicPath = (process.env.VUE_APP_PLATFORM === 'cordova' || process.env.NODE_ENV === 'production')
  ? './'
  : '/'

module.exports = {
  publicPath,
  devServer: {
    port: process.env.DEV_SERVER_PORT || 3000
  },
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    apollo: {
      lintGQL: true
    }
  },
  configureWebpack: {
    // webpack 5 removed default-on polyfills for many Node modules
    // the following config is about providing browser-friendly replacements

    resolve: {
      fallback: {
        path: require.resolve('path-browserify')
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'global.Date': 'globalThis.Date' // required for edtf
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    ]
  }
}
