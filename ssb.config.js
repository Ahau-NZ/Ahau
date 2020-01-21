const Config = require('ssb-config/inject')
const fs = require('fs')
const path = require('path')

const customConfig = {
  port: 8087,
  caps: {
    shs: 'LftKJZRB4nbBRnlJuFteWG9AP+gGboVEhibx016bR0s='
  },
  lan: {
    legacy: false
  }
}

module.exports = function () {
  const config = Config('ssb-ahau', Object.assign({}, customConfig))

  fs.writeFile(
    path.join(config.path, 'config'),
    JSON.stringify(customConfig, null, 2),
    (err) => {
      if (err) throw err
      console.log('saved config')
    }
  )

  return config
}
