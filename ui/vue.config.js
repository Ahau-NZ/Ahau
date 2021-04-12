process.env.VUE_APP_PLATFORM =
  process.env.PLATFORM === 'cordova' ? 'cordova' : 'web'

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
