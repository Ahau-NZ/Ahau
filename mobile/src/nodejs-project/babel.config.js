module.exports = {
  targets: {
    node: '12.19'
  },
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: '3.36'
      }
    ]
  ]
}
