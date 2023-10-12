const ahoy = require('ssb-ahoy')
const env = require('ahau-env')()
const chalk = require('chalk')
const boxen = require('boxen')
const level = require('level')
const { join } = require('path')
const { app } = require('electron')
const { autoUpdater } = require('electron-updater')

const config = require('./ssb.config')()
const karakia = require('./karakia')

checkAhauRunning()
  .then(start)
  .then(ssb => {
    /* Karakia tūwhera */
    karakia()

    printConfig(ssb.config)

    if (env.isProduction) {
      autoUpdater.checkForUpdatesAndNotify()
    }
  })
  .catch((err) => {
    console.error(err.cause || err)
    console.log('EXITING')
    app.quit()
  })

function start () {
  return ahoy(
    env.isDevelopment
      ? `http://localhost:${process.env.DEV_SERVER_PORT || 3000}`
      : `file://${__dirname}/dist/index.html`, // eslint-disable-line
    {
      title: 'Āhau',
      config,
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
    }
  )
}

/* HELPERS */

function checkAhauRunning () {
  return new Promise((resolve, reject) => {
    const dbPath = join(config.path, 'tribes/keystore')
    level(dbPath, (err, db) => {
      if (err) {
        console.log(err.message)
        // if file doesn't exist yet => ahau never been started
        if (err.message.endsWith('No such file or directory')) return resolve()
        // other errors indicate a file LOCK exists => ahau open

        return reject(Error(err, { cause: 'Ahau already running' }))
      }

      db.close((err) => {
        if (err) console.error(err)
        resolve()
      })
    })
  })
}

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
