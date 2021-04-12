module.exports = {
  publicPath: './',
  devServer: {
    port: 8081
  },
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    apollo: {
      lintGQL: true
    }
  }
}
