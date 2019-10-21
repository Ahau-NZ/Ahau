const ahoy = require('ssb-ahoy')
const Config = require('ssb-config/inject')
const ssbClient = require('ssb-client')
const Graphql = require('./graphql')

const plugins = [
  'ssb-master',
  'ssb-unix-socket',
  'ssb-no-auth',

  // 'ssb-legacy-conn',
  'ssb-conn', // uninstalled for the moment
  // 'ssb-replicate',
  // 'ssb-friends',
  'ssb-invite',
  'ssb-private',
  'ssb-backlinks',
  'ssb-profile'

  // 'ssb-about',
  // 'ssb-query',
  // 'ssb-suggest'
]

const appURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080' // dev-server
    : `file://${__dirname}/dist/index.html` // production build

const config = Config('ssb-ahau', {
  caps: {
    shs: 'LftKJZRB4nbBRnlJuFteWG9AP+gGboVEhibx016bR0s='
  }
})

if (!process.env.SERVER) {
  ahoy({
    title: 'Whakapapa Ora',
    config,
    plugins,
    appURL,
    // appDir: '../whakapapa-ora', // only use this when ssb-ahoy symlinked
    onReady: ({ config }) => {
      console.log('<<< welcome aboard >>>')

      ssbClient(config.keys, config, (err, sbot) => {
        if (err) {
          console.log('BOOM')
          throw err
        }

        Graphql(sbot)
      })
    }
  })
} else {
  const Server = require('ssb-server')
  Server.use(require('ssb-master'))
    .use(require('ssb-conn'))
    .use(require('ssb-backlinks'))
    .use(require('ssb-profile'))
    .use(require('ssb-replicate'))
  const config = Config()
  const sbot = Server(config)
  Graphql(sbot)
}
