const path = require('path')
const ssbKeys = require('ssb-keys')
const makeConfig = require('ssb-config/inject')
const SecretStack = require('secret-stack')
const env = require('ahau-env')

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
const ssbPath = path.resolve(appDataDir, `.${appName}`)

// Create or migrate config path
createOrMigrate(appDataDir, appName, oldAppName)

const keys = ssbKeys.loadOrCreateSync(path.join(ssbPath, 'secret'))

const config = makeConfig(appName, {
  port: env.ahau.port,
  path: ssbPath,
  keys,
  caps: env.ahau.caps,
  conn: {
    autostart: true
  },
  lan: {
    legacy: false
  },
  friends: {
    hops: 2
  },
  connections: {
    incoming: {
      /* Causing error: */
      /* Error: ssb-config: conflicting connection settings for: net port */
      // net: [{ scope: 'private', transform: 'shs', port: 26831 }],
      tunnel: [{ scope: 'public', transform: 'shs' }]
    },
    outgoing: {
      net: [{ transform: 'shs' }],
      tunnel: [{ transform: 'shs' }]
    }
  },
  recpsGuard: {
    allowedTypes: [
      'contact', 'pub' // needed for ssb-invite
    ]
  },
  serveBlobs: {
    port: env.ahau.serveBlobs.port,
    cors: true,
    csp: ''
  },
  hyperBlobs: {
    port: env.ahau.hyperBlobs.port,
    autoPrune: false
  }
})

// eslint-disable-next-line no-useless-call
SecretStack({ appKey: env.ahau.caps.shs })
  // Core
  .use(require('ssb-master'))
  .use(require('ssb-db'))
  // Replication
  .use(require('ssb-replicate')) // needs: db
  .use(require('ssb-friends')) // needs: db, replicate
  // Connections
  .use(require('ssb-no-auth'))
  .use(require('ssb-lan'))
  .use(require('ssb-conn')) // needs: db, friends, lan
  .use(require('ssb-invite')) // needs: db, conn
  .use(require('ssb-promiscuous')) // needs: conn, friends
  // Queries
  .use(require('ssb-query')) // needs: db
  .use(require('ssb-backlinks')) // needs: db
  .use(require('ssb-whakapapa'))
  .use(require('ssb-profile'))
  .use(require('ssb-settings'))
  .use(require('ssb-artefact'))
  .use(require('ssb-story'))
  // Blobs
  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs')) // needs: blobs
  .use(require('ssb-hyper-blobs'))
  // Private groups
  .use(require('ssb-tribes'))
  // Custom
  .use(require('ssb-ahau'))
  .use(require('ssb-recps-guard'))
  .call(null, config)
