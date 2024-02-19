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
        require('ssb-atala-prism'),
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

// TODO extract

const pull = require('pull-stream')
const CRUT = require('ssb-crut')

const { pullAutoPresentationByRecps } = require('ssb-atala-prism/lib')
const registrationGroupSpec = require('ssb-tribes-registration/spec/registration-group')

function startAtalaPrism (ssb) {
  if (!ssb.config?.atalaPrism?.mediatorDID) {
    console.log('skipping atala-prism (no mediatorDID)')
    return
  }

  const registrationGroup = new CRUT(ssb, registrationGroupSpec)

  ssb.atalaPrism.start()
    .then(autoRequestPresentations)
    .catch(err => console.log('atala no!', err))

  function autoRequestPresentations () {
    pull(
      ssb.messagesByType({
        type: 'registration/group',
        private: true,
        live: true,
        old: false
      }),

      pull.filter(m => (
        m.value.author !== ssb.id && // ignore registrations I sent
        registrationGroup.isRoot(m)
      )),

      // filter for regristations which haven't had auto-presentation started
      pull.asyncMap((m, cb) => {
        const { recps } = m.value.content
        if (!recps) return cb(null, null) // filter at next step

        pull(
          pullAutoPresentationByRecps(ssb, recps),
          pull.take(1),
          pull.collect((err, autoPresentations) => {
            // if there was an error OR
            // if there is already an auto-presentation
            if (err || autoPresentations.length) cb(null, null) // filter at next step
            else cb(null, m.value.content) // allow to continue
          })
        )
      }),
      pull.filter(Boolean),

      pull.drain(content => {
        const { groupId, recps } = content // eslint-disable-line
        const [poBoxId, feedId] = recps

        ssb.atalaPrism.requestPresentation(groupId, poBoxId, feedId)
      })
    )
  }
}
