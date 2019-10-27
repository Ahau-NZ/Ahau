const { isMsg } = require('ssb-ref')

const cache = {}
const TIME_VALID = 5e3 // time cache is valid for

module.exports = function getProfile (sbot, id, cb) {
  if (!isMsg(id)) {
    cb(new Error('profile query expected %msgId, got ' + id))
  }

  if (cache[id] && cache[id].time + TIME_VALID > Date.now()) {
    console.log('serving the old value!')
    return cb(null, cache[id].state)
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

      cache[id] = {
        time: Date.now(),
        state
      }

      cb(null, state)
    })
    // >>>>
  })
}
