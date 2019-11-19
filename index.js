const ahoy = require('ssb-ahoy')
const ssbClient = require('ssb-client')
const Config = require('./ssb.config')
const Graphql = require('./graphql')

const plugins = [
  'ssb-master',
  'ssb-unix-socket',
  'ssb-no-auth',

  'ssb-conn',
  'ssb-lan',
  'ssb-replicate',
  'ssb-friends',
  'ssb-promiscuous', // temporary?

  'ssb-blobs',

  'ssb-backlinks',
  'ssb-whakapapa',
  'ssb-profile',

  'ssb-query',
  'ssb-serve-blobs'
  // 'ssb-private',
  // 'ssb-invite',
  // 'ssb-about',
  // 'ssb-suggest'
]

const appURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080' // dev-server
    : `file://${__dirname}/dist/index.html` // production build

ahoy({
  title: 'Whakapapa Ora',
  config: Config(),
  plugins,
  appURL,
  // appDir: '../whakapapa-ora', // only use this when ssb-ahoy symlinked
  onReady: ({ config }) => {
    // this config has updated manifest added

    ssbClient(config.keys, config, (err, sbot) => {
      if (err) {
        console.log('BOOM')
        throw err
      }

      Graphql(sbot)
    })
  }
})
