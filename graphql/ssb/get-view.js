const { isMsg } = require('ssb-ref')

module.exports = (sbot, id) => new Promise((resolve, reject) => {
  if (!isMsg(id)) {
    reject(new Error('profile query expected %msgId, got ' + id))
  }

  sbot.whakapapa.view.get(id, (err, view) => {
    if (err) return reject(err)

    view.id = id // TODO change ssb-whakapapa to do this?

    sbot.get({ id, private: true }, (_, value) => {
      view.authors = [ value.author ]

      resolve(view)
    })
  })
})
