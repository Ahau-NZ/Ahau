const pull = require('pull-stream')
const isProfile = require('ssb-profile/lib/is-profile')
const { isMsg } = require('ssb-ref')
const blobToURI = require('ssb-serve-blobs/id-to-url')
const get = require('lodash.get')

module.exports = function GetProfile (sbot) {
  const cache = new Cache()

  // start listening for profile updates
  pull(
    pullProfileUpdates(sbot, 'person'),
    pull.drain(invalidate)
  )
  pull(
    pullProfileUpdates(sbot, 'community'),
    pull.drain(invalidate)
  )
  // NOTE - we might get race conditions when a person updates a profile
  // as they save a change, which then results in indexing changes...

  return function getProfile (profileId, cb) {
    if (!isMsg(profileId)) {
      return cb(new Error('profile query expected %msgId, got ' + profileId))
    }

    const cached = cache.get(profileId)
    if (cached) {
      cb(null, cached)
      return
    }

    profileFromDb(profileId, (err, state) => {
      if (err) return cb(err)

      cache.set(profileId, state)
      cb(null, state)
    })
  }

  function profileFromDb (id, cb) {
    sbot.profile.get(id, (err, profile) => {
      if (err) return cb(err)
      // <<< WIP
      // WARNING! we're assuming just one head-state!
      const { state } = profile.states[0]
      sbot.get({ id, private: true }, (_, value) => {
        // TODO change ssb-profile to add id + authors
        state.id = id
        state.authors = [value.author]

        addURIs(state)

        cb(null, state)
      })
    })
  }

  function invalidate (profileId) {
    // invalidate current cached value
    cache.unset(profileId)

    // re-populate the cache state (eager load)
    profileFromDb(profileId, (err, state) => {
      if (err) return

      cache.set(profileId, state)
    })
  }
}

function Cache () {
  this.store = {}
  this.timeout = 5e3 // time a particular entry is valid for
}

Cache.prototype.get = function (id) {
  if (!this.store[id]) return

  return this.store[id].state
}
Cache.prototype.set = function (id, state) {
  this.store[id] = {
    time: Date.now(),
    state
  }
}
Cache.prototype.unset = function (id) {
  delete this.store[id]
}

function pullProfileUpdates (sbot, type) {
  const query = [{
    $filter: {
      value: {
        content: {
          type: 'profile/' + type,
          tangles: {
            profile: {
              root: { $is: 'string' }
            }
          }
        }
      },
      timestamp: { $gt: 0 }
    }
  }]

  return pull(
    // sbot.createLogStream({ live: true, old: false, private: true }),
    // this might be faster that ssb-query, but will pull a lot of data over muxrpc
    // (if the sbot is a remote connection)
    sbot.query.read({ query, live: true, old: false }),
    pull.filter(isProfile),
    pull.map(getProfileId)
  )
}

function getProfileId (msg) {
  return msg.value.content.tangles.profile.root
}

function addURIs (state) {
  if (get(state, 'avatarImage.blob')) {
    state.avatarImage.uri = blobToURI(state.avatarImage.blob)
  }

  if (get(state, 'headerImage.blob')) {
    state.headerImage.uri = blobToURI(state.headerImage.blob)
  }

  return state
}
