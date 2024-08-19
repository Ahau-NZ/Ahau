const Config = require('ssb-config/defaults')
const fs = require('fs')
const path = require('path')
const env = require('ahau-env')()
const crypto = require('crypto')
const envPaths = require('env-paths')
const merge = require('lodash.merge')

const appPath = envPaths(process.env.APP_NAME || env.ahau.appName, { suffix: '' }).data
const configPath = path.join(appPath, 'config')

// Ahau mediator did
const MEDIATOR_DID = 'did:peer:2.Ez6LSghwSE437wnDE1pt3X6hVDUQzSjsHzinpX3XFvMjRAm7y.Vz6Mkhh1e5CEYYq6JBUcTZ6Cp2ranCWRrv7Yax3Le4N59R6dd.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MCIsImEiOlsiZGlkY29tbS92MiJdfX0.SeyJ0IjoiZG0iLCJzIjp7InVyaSI6IndzOi8vbG9jYWxob3N0OjgwODAvd3MiLCJhIjpbImRpZGNvbW0vdjIiXX19'

const core = {
  path: appPath,
  port: env.ahau.port,
  caps: env.ahau.caps,
  // caps = capabilities, only apps with:
  // - the same shs ("secret handshake") key can connect to each other
  // - thas same sign can verify (+replicatie) messages with each other
  friends: { hops: 2 },
  lan: { legacy: false }, // disables legacy UDP announce (which doesn't respect caps.shs!)
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

let config = null

module.exports = function () {
  if (config) return config

  let persisted = loadPersisted(configPath) || {}
  persisted = tidyPersisted(persisted)
  if (!persisted.mixpanelId) persisted.mixpanelId = generateId()

  config = Config(env.ahau.appName, merge({}, core, persisted))

  // Persist our mixpanel ID for anonymous analytics
  // NOTE we may want to persist more if we ever need ssb-client
  fs.writeFileSync(
    configPath,
    JSON.stringify(persisted, null, 2),
    (err) => {
      if (err) throw err
    }
  )

  return config
}

function loadPersisted (configPath) {
  try {
    const persisted = fs.readFileSync(configPath, 'utf8')
    return JSON.parse(persisted)
  } catch (err) {
    if (err.message.match(/no such file/)) return

    // eslint-disable-next-line no-console
    console.error('Invalid JSON in', configPath)
    throw err
  }
}

function generateId () {
  return crypto.randomBytes(32).toString('base64')
}

function tidyPersisted (config) {
  // NOTE a previous iteration of the app persisted way too much to config
  // this seemed to cause problems.
  // This is designed to prune back those old cases, while still allowing people to
  // add their own config (assumption: they will not add config.keys!)
  return config.keys
    ? { mixpanelId: config.mixpanelId }
    : config
}
