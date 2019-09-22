const ahoy = require('ssb-ahoy')
const Config = require('ssb-config/inject')
const ssbClient = require('ssb-client')
const graphql = require('./graphql')

const plugins = [
  'ssb-conn',
  // 'ssb-replicate',
  // 'ssb-friends',
  // 'ssb-invite',
  'ssb-private'
  // 'ssb-backlinks',
  // 'ssb-about',
  // 'ssb-query',
  // 'ssb-suggest'
]

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:8080`
    : `file://${__dirname}/index.html`

ahoy(
  {
    title: 'Whakapapa Ora',
    config: Config(),
    plugins,
    uiPath: winURL
    // uiPath: winURL // entry point to your main app
  },
  state => {
    console.log('welcome aboard')
    console.log(state)
    ssbClient(function (err, sbot) {
      if (err) throw err
      graphql(sbot)
    })
  }
)
