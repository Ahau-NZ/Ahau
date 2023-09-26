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
  }
}
