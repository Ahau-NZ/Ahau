const dotenv = require('dotenv')
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

module.exports = {
  publicPath: './',
  devServer: {
    port: 8080
  },
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    apollo: {
      lintGQL: true
    }
  }
}
