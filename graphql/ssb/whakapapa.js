module.exports = (sbot, id) => new Promise((resolve, reject) => {
  return sbot.whakapapa.get(id, (err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})
