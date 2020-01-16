const { isMsg } = require('ssb-ref')

module.exports = function GetWhakapapaView (sbot) {
  return function getWhakapapaView (id, cb) {
    if (!isMsg(id)) {
      return cb(new Error('profile query expected %msgId, got ' + id))
    }
    sbot.whakapapa.view.get(id, (err, view) => {
      if (err) return err
      view.id = id // TODO change ssb-whakapapa to do this?
      sbot.get({ id, private: true }, (_, value) => {
        view.authors = [value.author]

        cb(null, view)
      })
    })
  }
}
