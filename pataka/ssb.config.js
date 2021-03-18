const Config = require('ssb-config/defaults')
const { pataka: env } = require('ahau-env')
const fs = require('fs')
const path = require('path')

const customConfig = {
  port: env.port,
  allowPrivate: true, // used for making local invite codes
  // HACK: There is a problem with ssb-invite where it look for a public incoming connection in the config which does not exist
  // and then throws an error.
  // When allowPrivate:true it settles on a private/local address,
  // then invite.create({external}) overwrites the ip address of that address :(
  // Possible solution would be to pass host and port to ssb-invite and have it skip getAddress
  caps: env.caps,
  // caps = capabilities, only apps with:
  // - the same shs ("secret handshake") key can connect to each other
  // - thas same sign can verify (+replicatie) messages with each other
  lan: {
    legacy: false
    // disables legacy UDP announce (which doesn't respect caps.shs!)
  },
  serveBlobs: {
    port: env.serveBlobs.port,
    cors: true,
    csp: ''
  },
  hyperBlobs: {
    pataka: true
    // port: env.hyperBlobs.port // TODO
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

  // write a copy of this customConfig to ~/.{appName}/config
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
