const pull = require('pull-stream')
const env = require('ahau-env')
const graphqlServer = require('./graphql-server')

// const { PubSub } = require('apollo-server')
// const pubsub = new PubSub()

module.exports = {
  name: 'ssb-pataka',
  version: '1.0.0',
  init: function (sbot, cfg) {
    if (!env.isProduction || process.env.AHAU_LOGGING) {
      logPublish(sbot)
      logReplication(sbot)

      console.log('Logging log:info ...')
      sbot.on('log:info', m => console.log(m))
      // sbot.emit('log:info', ['listener working'])
    }

    graphqlServer(sbot)
  }
}

function logPublish (sbot) {
  pull(
    sbot.createUserStream({ id: sbot.id, live: true, old: false, private: true, meta: true }),
    pull.drain(m => {
      console.log('')
      console.log(m.value.sequence, m.key)
      console.log(JSON.stringify(m.value.content, null, 2))
      console.log('')
    })
  )
}

function logReplication (sbot) {
  pull(
    sbot.createLogStream({ live: true, old: false }),
    pull.filter(m => m.value.author !== sbot.id),
    pull.drain(m => {
      console.log(`replicated ${m.value.author}, seq: ${m.value.sequence}`)
    })
  )
}
