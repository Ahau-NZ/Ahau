const fs = require('fs')
const path = require('path')
const ssbKeys = require('ssb-keys')
const mkdirp = require('mkdirp')
const makeConfig = require('ssb-config/inject')
const SecretStack = require('secret-stack')
// TODO: update env here to use env.ahau
const env = require('ahau-env')

let appDataDir
const appName = process.env.NODE_ENV === 'development' ? 'ahau-dev' : 'ssb-ahau'
if (process.env.PLATFORM === 'cordova') {
  const cordova = require('cordova-bridge')
  appDataDir = cordova.app.datadir()
} else {
  appDataDir = require('os').homedir()
}

const ssbPath = path.resolve(appDataDir, `.${appName}`)
if (!fs.existsSync(ssbPath)) mkdirp.sync(ssbPath)
const keys = ssbKeys.loadOrCreateSync(path.join(ssbPath, 'secret'))

const config = makeConfig(appName, {
  path: ssbPath,
  keys,
  caps: env.caps,
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
    cors: true,
    csp: ''
  }
})

// eslint-disable-next-line no-useless-call
SecretStack({ appKey: env.caps.shs })
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
  .use(require('ssb-artefact'))
  .use(require('ssb-story'))
  // Blobs
  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs')) // needs: blobs
  // Private groups
  .use(require('ssb-tribes'))
  // Custom
  .use(require('ssb-ahau'))
  .use(require('ssb-recps-guard'))
  .call(null, config)
