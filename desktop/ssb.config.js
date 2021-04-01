const Config = require('ssb-config/defaults')
const fs = require('fs')
const path = require('path')

const env = require('ahau-env')

const customConfig = {
  port: env.ahau.port,
  caps: env.ahau.caps,
  // caps = capabilities, only apps with:
  // - the same shs ("secret handshake") key can connect to each other
  // - thas same sign can verify (+replicatie) messages with each other
  friends: { hops: 2 },
  lan: { legacy: false }, // disables legacy UDP announce (which doesn't respect caps.shs!)
  serveBlobs: {
    port: env.ahau.serveBlobs.port,
    cors: true,
    csp: ''
  },
  hyperBlobs: {
    port: env.ahau.hyperBlobs && env.ahau.hyperBlobs.port // TODO
  },
  recpsGuard: {
    allowedTypes: [
      'contact', 'pub' // needed for ssb-invite
    ]
  }
}

module.exports = function () {
  let appName = 'ahau'
  if (!env.isProduction) {
    console.log(`\x1b[37m\x1b[41m NODE_ENV \x1b[31m\x1b[47m ${env.name} \x1b[0m`)
    appName += `-${env.shortName || env.name}`
  }

  const config = Config(appName, customConfig)

  // write a copy of configConfig to ~/.{appName}/config
  fs.writeFile(
    path.join(config.path, 'config'),
    JSON.stringify(customConfig, null, 2),
    (err) => {
      if (err) throw err
      // console.log('saved config')
    }
  )

  return config
}
