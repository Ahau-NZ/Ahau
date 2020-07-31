const Config = require('ssb-config/inject')
const fs = require('fs')
const path = require('path')

const customConfig = {
  port: 8088,
  allowPrivate: true,
  caps: {
    shs: 'LftKJZRB4nbBRnlJuFteWG9AP+gGboVEhibx016bR0s='
    // this is the "secret handshake" capability.
    // only devices using this exact same code can talk to each other
  },
  lan: {
    legacy: false
    // disables legacy UDP announce (which doesn't respect caps.shs!)
  },
  serveBlobs: {
    cors: true,
    csp: ''
  },
  recpsGuard: {
    allowedTypes: [] // e.g. 'pub', 'announce'
  }
}

module.exports = function () {
  const appName =
    process.env.NODE_ENV === 'development' ? 'ahau-pataka-dev' : 'ahau-pataka'

  const config = Config(appName, Object.assign({}, customConfig))

  // write a copy of this config to ~/.{appName}/config
  fs.writeFile(
    path.join(config.path, 'config'),
    JSON.stringify(customConfig, null, 2),
    err => {
      if (err) throw err
      console.log('saved config')
    }
  )

  return config
}
