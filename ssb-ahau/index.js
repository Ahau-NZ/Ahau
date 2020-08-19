const pull = require('pull-stream')
const graphqlServer = require('./graphql-server')

module.exports = {
  name: 'ssb-ahau',
  version: '1.0.0',
  init: function (sbot, config) {
    if (process.env.NODE_ENV === 'development') {
      logPublish(sbot)
    }

    graphqlServer(sbot)
    lanConn(sbot)
  }
}

function logPublish (sbot) {
  sbot.post(m => {
    console.log(m.value.sequence, m.key)

    sbot.get({ id: m.key, private: true, meta: true }, (err, m) => {
      if (err) return console.error(err)

      console.log(JSON.stringify(m.value.content, null, 2))
      console.log('------------------\n\n')
    })
  })
}

function lanConn (sbot) {
  pull(
    sbot.lan.discoveredPeers(),
    pull.through(console.log),
    pull.drain(({ address, verified }) => {
      pull.conn.connect(address, (err, data) => {
        console.log(err, data)
      })
    })
  )
}
