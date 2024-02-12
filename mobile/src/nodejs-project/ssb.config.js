const path = require('path')
const Config = require('ssb-config/defaults')
const env = require('ahau-env')()

const { createOrMigrate } = require('./config-helper')

// Get base path
let appDataDir
if (process.env.PLATFORM === 'cordova') {
  const cordova = require('cordova-bridge')
  appDataDir = cordova.app.datadir()
} else {
  appDataDir = require('os').homedir()
}

// App name
const oldAppName = process.env.NODE_ENV === 'development' ? 'ahau-dev' : 'ssb-ahau'
const appName = env.ahau.appName
const appPath = path.resolve(appDataDir, `.${appName}`)

const core = {
  path: appPath,
  port: env.ahau.port,
  caps: env.ahau.caps,
  // conn: { autostart: true },
  friends: { hops: 2 },
  lan: { legacy: false },
  // connections: {
  //   incoming: {
  //     [> Causing error: <]
  //     [> Error: ssb-config: conflicting connection settings for: net port <]
  //     // net: [{ scope: 'private', transform: 'shs', port: 26831 }],
  //     tunnel: [{ scope: 'public', transform: 'shs' }]
  //   },
  //   outgoing: {
  //     net: [{ transform: 'shs' }],
  //     tunnel: [{ transform: 'shs' }]
  //   }
  // },
  serveBlobs: {
    port: env.ahau.serveBlobs.port,
    cors: true,
    csp: ''
  },
  hyperBlobs: {
    port: env.ahau.hyperBlobs.port,
    autoPrune: false
  },
  graphql: {
    port: env.ahau.graphql.port
  },
  recpsGuard: {
    allowedTypes: [
      'contact', 'pub' // needed for ssb-invite
    ]
  }
}

module.exports = function () {
  // Create or migrate config path
  createOrMigrate(appDataDir, appName, oldAppName)

  return Config(appName, core)
}
