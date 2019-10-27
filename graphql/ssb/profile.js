const { isMsg } = require('ssb-ref')

module.exports = function getProfile (sbot, id, cb) {
  if (!isMsg(id)) {
    cb(new Error('profile query expected %msgId, got ' + id))
  }

  sbot.profile.get(id, (err, profile) => {
    if (err) return cb(err)

    // <<< WIP
    // WARNING! we're assuming just one head-state!
    const { state } = profile.states[0]

    // Get the original message and call that the tiaki (guardian)
    sbot.get(id, (_, { author }) => {
      state.id = id // TODO change ssb-profile to do this
      state.tiaki = author
      cb(null, state)
    })
    // >>>>
  })
}
