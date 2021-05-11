const Config = require('ssb-config/defaults')
const env = require('ahau-env')
const fs = require('fs')
const path = require('path')

const customConfig = {
  port: env.pataka.port,
  allowPrivate: true, // used for making local invite codes
  // HACK: There is a problem with ssb-invite where it look for a public incoming connection in the config which does not exist
  // and then throws an error.
  // When allowPrivate:true it settles on a private/local address,
  // then invite.create({external}) overwrites the ip address of that address :(
  // Possible solution would be to pass host and port to ssb-invite and have it skip getAddress
  caps: env.pataka.caps,
  // caps = capabilities, only apps with:
  // - the same shs ("secret handshake") key can connect to each other
  // - thas same sign can verify (+replicatie) messages with each other
  lan: {
    legacy: false
    // disables legacy UDP announce (which doesn't respect caps.shs!)
  },
  serveBlobs: {
    port: env.pataka.serveBlobs.port,
    cors: true,
    csp: ''
  },
  hyperBlobs: {
    pataka: true,
    port: env.pataka.hyperBlobs.port
  },
  recpsGuard: {
    allowedTypes: [
      'contact'
    ]
  }
}

module.exports = function () {
  const config = Config(env.pataka.appName, customConfig)

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
