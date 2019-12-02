const { isMsg } = require('ssb-ref')
const blobToURI = require('ssb-serve-blobs/id-to-url')
const get = require('lodash.get')

const TIME_VALID = 5e3 // time cache is valid for
const cache = new Cache()

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

module.exports = (sbot, id) => new Promise((resolve, reject) => {
  if (!isMsg(id)) {
    reject(new Error('profile query expected %msgId, got ' + id))
  }

  const lookup = cache.get(id)
  if (lookup) return resolve(lookup)

  sbot.profile.get(id, (err, profile) => {
    if (err) return reject(err)

    // <<< WIP
    // WARNING! we're assuming just one head-state!
    const { state } = profile.states[0]

    // Get the original message and use tha to define the authors / tiaki
    sbot.get({ id, private: true }, (_, value) => {
      state.id = id // TODO change ssb-profile to do this
      state.authors = [ value.author ]

      addURIs(state)

      cache.set(id, state)

      resolve(state)
    })
    // >>>>
  })
})

function addURIs (state) {
  if (get(state, 'avatarImage.blob')) {
    state.avatarImage.uri = blobToURI(state.avatarImage.blob)
  }

  if (get(state, 'headerImage.blob')) {
    state.headerImage.uri = blobToURI(state.headerImage.blob)
  }

  return state
}
