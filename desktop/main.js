/* eslint-disable camelcase */
const ahoy = require('ssb-ahoy')
const env = require('ahau-env')()
const chalk = require('chalk')
const boxen = require('boxen')
const level = require('level')
const { join } = require('path')
const { app } = require('electron')
const { autoUpdater } = require('electron-updater')

// WARNING monkey patch! --------------------------------------
const na = require('sodium-native')
na.sodium_malloc = function sodium_malloc_monkey_patched (n) {
  return Buffer.alloc(n)
}
na.sodium_free = function sodium_free_monkey_patched () {}
// Electron > 20.3.8 breaks a napi method that `sodium_malloc`
// depends on to create external buffers. (see v8 memory cage)
//
// This crashes electron when called by various libraries, so
// we monkey-patch this particular function.
// ------------------------------------------------------------

const config = require('./ssb.config')()
const plugins = require('./ssb.plugins.js')
const karakia = require('./karakia')
const startAtalaPrism = require('./atala-prism')

checkAhauRunning()
  .then(start)
  .then(ssb => {
    /* Karakia tūwhera */
    karakia()

    printConfig(ssb.config)

    if (env.isProduction) {
      autoUpdater.checkForUpdatesAndNotify()
    }

    startAtalaPrism(ssb)
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
      plugins
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
