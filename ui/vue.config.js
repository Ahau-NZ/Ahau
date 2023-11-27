const publicPath = (
  import.meta.env.VITE_APP_PLATFORM === 'cordova' ||
  import.meta.env.PROD
) ? './' : '/'

module.exports = {
  publicPath,
  devServer: {
    // TODO ?
    port: process.env.DEV_SERVER_PORT || 3000
  },
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    apollo: {
      lintGQL: true
    }
  }
}
