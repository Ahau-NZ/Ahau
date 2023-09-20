const ahoy = require('ssb-ahoy')
const env = require('ahau-env')()
const chalk = require('chalk')
const boxen = require('boxen')
const { autoUpdater } = require('electron-updater')

const Config = require('./ssb.config')
const karakia = require('./karakia')

ahoy(
  env.isDevelopment
    ? `http://localhost:${process.env.DEV_SERVER_PORT || 3000}` // dev-server
    : `file://${__dirname}/dist/index.html`, // production build
  {
    title: 'Ahau',
    config: Config(),
    plugins: [
      require('ssb-db'),
      require('ssb-conn'),
      require('ssb-lan'),
      require('ssb-replicate'),
      require('ssb-friends'),

      require('ssb-blobs'),
      require('ssb-serve-blobs'),
      require('ssb-hyper-blobs'),

      require('ssb-query'),
      require('ssb-backlinks'),

      require('ssb-invite'),
      require('ssb-tribes'),
      require('ssb-tribes-registration'),

      require('ssb-profile'),
      require('ssb-settings'),
      require('ssb-story'),
      require('ssb-artefact'),
      require('ssb-whakapapa'),
      require('ssb-submissions'),

      require('ssb-ahau'),
      require('ssb-recps-guard')
    ]
  },
  (err, ssb) => {
    if (err) return console.log(err)
    if (err) throw err
    // this config has updated manifest added

    /* Karakia tūwhera */
    karakia()

    printConfig(ssb.config)

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

  // eslint-disable-next-line no-console
  console.log(boxen(configTxt, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue'
  }))
}
