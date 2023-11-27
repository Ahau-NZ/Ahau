const publicPath = (
  import.meta.env.VITE_APP_PLATFORM === 'cordova' ||
  import.meta.env.PROD
) ? './' : '/'

module.exports = {
  publicPath,
  // NOTE
  // - publicPath may be over-ridden by the "base" setting in vite.config.js
  // - import.meta.env may be the wrong env (should this by process.env?)
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
