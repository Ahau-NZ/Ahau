const Config = require('ssb-config/defaults')
const env = require('ahau-env')
// const fs = require('fs')
// const path = require('path')

const customConfig = {
  port: 8088,
  // allowPrivate: true, // used for making local invite codes
  caps: env.caps,
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
  let appName = 'ahau-pataka'
  if (!env.isProduction) {
    console.log(`\x1b[37m\x1b[41m NODE_ENV \x1b[31m\x1b[47m ${env.name} \x1b[0m`)
    appName += `-${env.shortName || env.name}`
  }
  const config = Config(appName, customConfig)

  // write a copy of this config to ~/.{appName}/config
  // fs.writeFile(
  //   path.join(config.path, 'config'),
  //   JSON.stringify(customConfig, null, 2),
  //   err => {
  //     if (err) throw err
  //     // console.log('saved config')
  //   }
  // )

  return config
}
