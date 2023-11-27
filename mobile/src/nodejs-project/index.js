const path = require('path')
const ssbKeys = require('ssb-keys')
const makeConfig = require('ssb-config/inject')
const SecretStack = require('secret-stack')
const { ahau: env } = require('ahau-env')()

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
const appName = env.appName
const ssbPath = path.resolve(appDataDir, `.${appName}`)

// Create or migrate config path
createOrMigrate(appDataDir, appName, oldAppName)

const keys = ssbKeys.loadOrCreateSync(path.join(ssbPath, 'secret'))

const config = makeConfig(appName, {
  path: ssbPath,
  port: env.port,
  keys,
  caps: env.caps,

  conn: { autostart: true },
  friends: { hops: 2 },
  lan: { legacy: false },

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
  serveBlobs: {
    port: env.serveBlobs.port,
    cors: true,
    csp: ''
  },
  hyperBlobs: {
    port: env.hyperBlobs.port,
    autoPrune: false
  },
  graphql: {
    port: env.graphql.port
  },
  recpsGuard: {
    allowedTypes: [
      'contact', 'pub' // needed for ssb-invite
    ]
  }
})

// eslint-disable-next-line no-useless-call
SecretStack({ appKey: env.caps.shs })
  // .use(require('ssb-master'))
  .use(require('ssb-db'))
  .use(require('ssb-query'))
  .use(require('ssb-backlinks'))

  // .use(require('ssb-no-auth'))
  .use(require('ssb-conn')) // needs: db, friends, lan
  .use(require('ssb-lan'))
  .use(require('ssb-replicate')) // needs: db
  .use(require('ssb-friends')) // needs: db, replicate
  // .use(require('ssb-promiscuous')) // needs: conn, friends

  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs')) // needs: blobs
  .use(require('ssb-hyper-blobs'))

  .use(require('ssb-invite')) // needs: db, conn
  .use(require('ssb-tribes'))
  .use(require('ssb-tribes-registration'))

  .use(require('ssb-profile'))
  .use(require('ssb-settings'))
  .use(require('ssb-story'))
  .use(require('ssb-artefact'))
  .use(require('ssb-whakapapa'))
  .use(require('ssb-submissions'))

  .use(require('ssb-ahau'))
  .use(require('ssb-recps-guard'))

  .call(null, config)
