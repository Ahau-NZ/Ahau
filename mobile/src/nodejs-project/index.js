/* eslint-disable brace-style */
const SecretStack = require('secret-stack')
const { ahau: env } = require('ahau-env')()
const cordova = require('cordova-bridge')
const pull = require('pull-stream')

const config = require('./ssb.config')()

// eslint-disable-next-line no-useless-call
const ssb = SecretStack({ appKey: env.caps.shs })
  // .use(require('ssb-master'))
  .use(require('ssb-db'))
  .use(require('ssb-query'))
  .use(require('ssb-backlinks'))

  // .use(require('ssb-no-auth'))
  .use(require('ssb-conn')) // needs: db, friends, lan
  .use(require('ssb-lan'))
  .use(require('ssb-replicate')) // needs: db
  .use(require('ssb-friends')) // needs: db, replicate
  // .use(require('ssb-promiscuous')) // needs: conn, friends

  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs')) // needs: blobs
  .use(require('ssb-hyper-blobs'))

  .use(require('ssb-invite')) // needs: db, conn
  .use(require('ssb-tribes'))
  .use(require('ssb-tribes-registration'))

  .use(require('ssb-profile'))
  .use(require('ssb-settings'))
  .use(require('ssb-story'))
  .use(require('ssb-artefact'))
  .use(require('ssb-whakapapa'))
  .use(require('ssb-submissions'))

  .use(require('ssb-ahau'))
  .use(require('ssb-recps-guard'))

  .call(null, config)

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
