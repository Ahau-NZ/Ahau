/* eslint-disable brace-style */
require('./monkey-patches.js')

const SecretStack = require('secret-stack')
const { ahau: env } = require('ahau-env')()
const cordova = require('cordova-bridge')
const pull = require('pull-stream')

const config = require('./ssb.config')()
const plugins = require('./ssb.plugins')
const startAtalaPrism = require('./atala-prism')

console.log('BUILD 2024-02-29, 14:11am NZT')

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
