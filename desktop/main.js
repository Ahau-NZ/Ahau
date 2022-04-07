const ahoy = require('ssb-ahoy')
const env = require('ahau-env')()
const chalk = require('chalk')
const boxen = require('boxen')
const { autoUpdater } = require('electron-updater')

const Config = require('./ssb.config')
const karakia = require('./karakia')

ahoy(
  env.isDevelopment
    ? 'http://localhost:8080' // dev-server
    : `file://${__dirname}/dist/index.html`, // production build
  {
    title: 'Ahau',
    config: Config(),
    plugins: [
      require('ssb-db'),
      // require('ssb-master'),
      // require('ssb-unix-socket'),
      // require('ssb-no-auth'),
      require('ssb-conn'),
      require('ssb-lan'),
      require('ssb-replicate'),
      require('ssb-friends'),

      require('ssb-blobs'),
      require('ssb-serve-blobs'),
      require('ssb-hyper-blobs'),

      require('ssb-query'),
      require('ssb-backlinks'),

      require('ssb-tribes'),
      require('ssb-tribes-registration'),

      require('ssb-profile'),
      require('ssb-settings'),
      require('ssb-story'),
      require('ssb-artefact'),
      require('ssb-whakapapa'),

      require('ssb-invite'),
      require('ssb-ahau'),
      require('ssb-recps-guard')
    ]
  },
  (err, ssb) => {
    if (err) throw err
    // this config has updated manifest added

    /* Karakia tūwhera */
    karakia()

    printConfig(ssb.config)
    console.log(ssb.config.host)

    if (env.isProduction) {
      autoUpdater.checkForUpdatesAndNotify()
    }
  }
)

function printConfig (config) {
  const envName = env.isProduction ? '' : ` ${env.name.toUpperCase()} `

  const configTxt = chalk`{blue AHAU} {white.bgRed ${envName}}

{bold feedId}  ${config.keys.id}
{bold path}    ${config.path}
{bold network}
  ├── host  ${config.host}
  ├── port  ${config.port}
  └── api   http://localhost:${config.graphql.port}/graphql
`

  console.log(boxen(configTxt, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue'
  }))
}
