const { isMsg } = require('ssb-ref')

const TIME_VALID = 5e3 // time cache is valid for
const cache = new Cache()
var lookup

module.exports = function getProfile (sbot, id, cb) {
  if (!isMsg(id)) {
    cb(new Error('profile query expected %msgId, got ' + id))
  }

  lookup = cache.get(id)
  if (lookup) return cb(null, lookup)

  sbot.profile.get(id, (err, profile) => {
    if (err) return cb(err)

    // <<< WIP
    // WARNING! we're assuming just one head-state!
    const { state } = profile.states[0]

    // Get the original message and call that the tiaki (guardian)
    sbot.get(id, (_, { author }) => {
      state.id = id // TODO change ssb-profile to do this
      state.tiaki = author

      cache.set(id, state)

      cb(null, state)
    })
    // >>>>
  })
}

function Cache () {
  this.store = {}
}
Cache.prototype.get = function (id) {
  if (this.store[id] && this.store[id].time + TIME_VALID > Date.now()) {
    return this.store[id].state
  }
}
Cache.prototype.set = function (id, state) {
  this.store[id] = {
    time: Date.now(),
    state
  }
}
