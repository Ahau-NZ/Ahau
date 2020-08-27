const pull = require('pull-stream')
const graphqlServer = require('./graphql-server')

module.exports = {
  name: 'ssb-ahau',
  version: '1.0.0',
  init: function (sbot, config) {
    if (process.env.NODE_ENV === 'development') {
      logPublish(sbot)
      logReplication(sbot)
    }

    graphqlServer(sbot)
    lanConn(sbot)
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

function lanConn (sbot) {
  pull(
    sbot.lan.discoveredPeers(),
    pull.filter(p => p.verified),
    pull.drain(({ address, verified }) => {
      sbot.conn.connect(address, (err, peer) => {
        if (err) return console.error(err)
        if (!peer) return

        console.log('connected to local peer:', peer.id)
        // replicate their first 100 messages so we can see their name / avatar
        // pull(
        //   peer.createHistoryStream({ id: peer.id, keys: false, limit: 100 }),
        //   sbot.createWriteStream()
        // )
      })
    })
  )
}
