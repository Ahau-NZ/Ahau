process.env.VUE_APP_PLATFORM =
  process.env.PLATFORM === 'cordova' ? 'cordova' : 'web'

module.exports = {
  publicPath: './',
  transpileDependencies: ['vuetify']
}
