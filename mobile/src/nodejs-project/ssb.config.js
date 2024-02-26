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

// TEMP for testing
const MEDIATOR_DID = 'did:peer:2.Ez6LSghwSE437wnDE1pt3X6hVDUQzSjsHzinpX3XFvMjRAm7y.Vz6Mkhh1e5CEYYq6JBUcTZ6Cp2ranCWRrv7Yax3Le4N59R6dd.SeyJ0IjoiZG0iLCJzIjoiaHR0cHM6Ly9iZXRhLW1lZGlhdG9yLmF0YWxhcHJpc20uaW8iLCJyIjpbXSwiYSI6WyJkaWRjb21tL3YyIl19'

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
  atalaPrism: {
    mediatorDID: MEDIATOR_DID
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
