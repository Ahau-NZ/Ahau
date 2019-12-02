const { isMsg } = require('ssb-ref')

module.exports = (sbot, id) => new Promise((resolve, reject) => {
  if (!isMsg(id)) {
    reject(new Error('profile query expected %msgId, got ' + id))
  }

  sbot.whakapapa.view.get(id, (err, view) => {
    if (err) return reject(err)

    // <<< WIP
    // WARNING! we're assuming just one head-state!
    const { state } = view.states[0]

    // Get the original message and use tha to define the authors / tiaki
    sbot.get(id, (_, value) => {
      state.id = id // TODO change ssb-whakapapa to do this
      state.authors = [ value.author ]

      resolve(state)
    })
    // >>>>
  })
})
