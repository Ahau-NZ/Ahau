const Config = require('ssb-config/defaults')
const fs = require('fs')
const path = require('path')

const { NODE_ENV } = process.env
const STAGING = 'staging'
const DEVELOPMENT = 'development'

if (NODE_ENV && NODE_ENV !== DEVELOPMENT && NODE_ENV !== STAGING) {
  throw new Error(`Invalid NODE_ENV: "${NODE_ENV}"`)
}

let caps
let appName
switch (NODE_ENV) {
  case DEVELOPMENT:
    appName = 'ahau-pataka-dev'
    caps = {
      shs: 'BHjvWx+Z2GiHMPKxUXQn+AYCXPLsYkSVCoDfldJA9Fc=',
      sign: 'tk6lgL0VpIhBotkcAlfyw+me4ysxY3bItUVwvIdiByI='
    }
    break

  case STAGING:
    appName = 'ahau-pataka-staging'
    caps = {
      shs: 'WPP7e6UeR6ur6bt/qxd1dPKGyXn1dqv2bDAeVTNXDuI=',
      sign: 'zIHQqbxSpYeFEGnIWz2JaEHLpbHz2xd7if7f9fyOMJA='
    }
    break

  default: // production
    appName = 'ahau-pataka'
    caps = {
      shs: 'PW7NiFTuMDjzsNqZaWQ5gDUQdi8mHK2JcbZLx4HCyv8=',
      sign: 'Peoj4NUl0I8EXp62EpKPcEcK28QGQ7tjk/vmyUOpzbY='
    }
}

const customConfig = {
  port: 8088,
  // allowPrivate: true, // used for making local invite codes
  caps,
  // caps = capabilities, only apps with:
  // - the same shs ("secret handshake") key can connect to each other
  // - thas same sign can verify (+replicatie) messages with each other
  lan: {
    legacy: false
    // disables legacy UDP announce (which doesn't respect caps.shs!)
  },
  serveBlobs: {
    cors: true,
    csp: ''
  },
  recpsGuard: {
    allowedTypes: [
      'contact'
    ]
  }
}

module.exports = function () {
  if (NODE_ENV) {
    console.log(`\x1b[37m\x1b[41m NODE_ENV \x1b[31m\x1b[47m ${process.env.NODE_ENV} \x1b[0m`)
  }
  const config = Config(appName, customConfig)

  // write a copy of this config to ~/.{appName}/config
  fs.writeFile(
    path.join(config.path, 'config'),
    JSON.stringify(customConfig, null, 2),
    err => {
      if (err) throw err
      // console.log('saved config')
    }
  )

  return config
}
