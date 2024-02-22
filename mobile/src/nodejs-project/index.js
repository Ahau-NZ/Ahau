/* eslint-disable brace-style */

// MONKEY PATCH - Array.prototype.at
// - used by atala-prism
// - not supported in Node 12.19
// - babel currently fails to transform
require('core-js/es/array/at')

// MONKEY PATCH - crypto.getRandomValues
// - used by ???
// - not supported in Node 12.19
const crypto = require('crypto')
if (!crypto.getRandomValues) {
  crypto.getRandomValues = function getRandomValuesMonkeyPatched (typedArr) {
    return crypto.randomFillSync(typedArr)
  }
}

// MONKEY PATCH - TextDecoder
// - used by @atala/prism-wallet-sdk
// - "fatal" option is not supported on Node.js compiled without ICU
const util = require('util')
util.TextDecoder = class TextDecoderMonkeyPatched extends util.TextDecoder {
  constructor (encoding, opts) {
    let monkeyGo = false
    if (opts && opts.fatal === true) {
      monkeyGo = true
      opts.fatal = false
    }
    super(encoding, opts)

    if (monkeyGo) this._fatal = true
  }

  decode (input, opts) {
    if (opts && opts.stream === true) {
      throw Error('TODO fix monkey patched decode with opts.stream')
    }
    const result = super.decode(input)
    if (this._fatal && result.includes('\uFFFD')) { // �
      const err = new TypeError('The encoded data was not valid for encoding utf-8')
      err.code = 'ERR_ENCODING_INVALID_ENCODED_DATA'
      err.errno = 11
      throw err
    }
    return result
  }
}

console.log('BUILD 2024-02-22 16:38')

const SecretStack = require('secret-stack')
const { ahau: env } = require('ahau-env')()
const cordova = require('cordova-bridge')
const pull = require('pull-stream')

const config = require('./ssb.config')()
const plugins = require('./ssb.plugins')
const startAtalaPrism = require('./atala-prism')

// eslint-disable-next-line no-useless-call
const ssb = SecretStack({ appKey: env.caps.shs })
  .use(plugins)
  .call(null, config)

startAtalaPrism(ssb)

cordova.channel.on('ssb', ({ type = 'async', path, args }) => {
  let func = ssb
  let _path = path.split('.')
  while (_path.length) {
    const get = _path.shift()
    func = func[get]
    if (!func) {
      console.error('No such path:', path)
      _path = []
    }
  }

  const cb = (err, result) => {
    if (err) cordova.channel.post('error', err)
    else cordova.channel.post('result', { path, args, result })
  }

  if (type === 'async') func(...args, cb)
  else if (type === 'source') {
    pull(
      func(...args),
      pull.collect(cb)
    )
  }
  else if (type === 'sync') {
    try {
      const result = func(...args)
      cb(null, result)
    } catch (err) {
      cb(err)
    }
  }
  else console.log('type not yet supported:', type)
})
