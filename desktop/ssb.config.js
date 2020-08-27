const Config = require('ssb-config/defaults')
const fs = require('fs')
const path = require('path')

const customConfig = {
  port: 8087,
  caps: {
    shs: 'LftKJZRB4nbBRnlJuFteWG9AP+gGboVEhibx016bR0s='
    // this is the "secret handshake" capability.
    // only devices using this exact same code can talk to each other
  },
  friends: { hops: 2 },
  lan: { legacy: false }, // disables legacy UDP announce (which doesn't respect caps.shs!)
  serveBlobs: {
    cors: true,
    csp: ''
  },
  recpsGuard: {
    allowedTypes: [
      'contact', 'pub' // needed for ssb-invite
    ]
  }
}

module.exports = function () {
  const appName = process.env.NODE_ENV === 'development'
    ? 'ahau-dev'
    : 'ssb-ahau'

  const config = Config(appName, customConfig)

  // write a copy of this config to ~/.{appName}/config
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
