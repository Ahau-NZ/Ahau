// SEE ALSO in /patches
// - broadcast-channel
// - brorand
// - ssb-ahau
// - urlpattern-polyfill

// Array.prototype.at
// - used by atala-prism
// - not supported in Node 12.19
// - babel currently fails to transform
require('core-js/actual')

// crypto.getRandomValues
// - used by ???
// - not supported in Node 12.19
const crypto = require('crypto')
if (!crypto.getRandomValues) {
  crypto.getRandomValues = function getRandomValuesMonkeyPatched (typedArr) {
    return crypto.randomFillSync(typedArr)
  }
}

// TextDecoder
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

// fetch
// - used by the abortcontroller-polyfill ... and elsewhere
const fetch = require('node-fetch')
globalThis.fetch = fetch
globalThis.Headers = fetch.Headers
globalThis.Request = fetch.Request
globalThis.Response = fetch.Response

// AbortController
// - used by @atala/prism-wallet-sdk
require('abortcontroller-polyfill/dist/polyfill-patch-fetch')
