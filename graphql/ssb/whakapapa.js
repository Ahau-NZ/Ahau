module.exports = function getWhakapapa (sbot, id, cb) {
  return sbot.whakapapa.get(id, (err, data) => {
    if (err) return cb(err)
    return cb(null, data)
  })
}
