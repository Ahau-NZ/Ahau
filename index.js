const ahoy = require('ssb-ahoy')
const Config = require('ssb-config/inject')
const ssbClient = require('ssb-client')
const Graphql = require('./graphql')

const plugins = [
  'ssb-master',
  'ssb-unix-socket',
  'ssb-no-auth',

  'ssb-legacy-conn',
  // 'ssb-conn', // uninstalled for the moment
  // 'ssb-replicate',
  // 'ssb-friends',
  'ssb-invite',
  'ssb-private'
  // 'ssb-backlinks',
  // 'ssb-about',
  // 'ssb-query',
  // 'ssb-suggest'
]

ahoy(
  {
    title: 'Whakapapa Ora',
    config: Config(),
    plugins,

    // appDir: '../whakapapa-ora', // only with ssb-ahoy symlinked

    appURL: process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080' // dev-server
      : `file://${__dirname}/bundle/index.html`
  },
  ({ config }) => {
    console.log('<<< welcome aboard >>>')

    setImmediate(
      () => ssbClient(config.keys, config, (err, sbot) => {
        if (err) throw err

        Graphql(sbot)
      })
    )
  }
)
