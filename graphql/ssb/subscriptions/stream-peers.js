const pull = require('pull-stream')

module.exports = function PostUploadFile (sbot, pubsub) {
  return function postUploadFile (file, cb) {
    pull(
      sbot.conn.peers(),
      pull.drain(
        data => {
          const formated = data.map(p => ({
            id: p[1].key,
            state: p[1].state
          }))
          return pubsub.publish('peer', formated)
        },
        err => {
          throw err
        }
      )
    )
    return pubsub.asyncIterator(['peer'])
  }
}
