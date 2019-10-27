const pull = require('pull-stream')
const pullParamap = require('pull-paramap')
const isProfile = require('ssb-profile/lib/is-profile')

module.exports = function profiles (sbot, cb) {
  const query = [
    {
      $filter: {
        timestamp: { $gt: 0 }, // forces order by received time
        value: {
          // timestamp: { $gt: 0 }, // forces order by asserted publish time
          content: {
            type: 'profile/person',
            tangles: {
              profile: { root: null, previous: null }
            }
          }
        }
      }
    }
  ]

  pull(
    sbot.query.read({ query }),
    pull.filter(isProfile),
    pullParamap(
      (root, cb) =>
        sbot.profile.get(root.key, (err, profile) => {
          if (err) cb(null, null)
          else {
            const { state } = profile.states[0] // WARNING! we're assuming just one head-state!
            cb(null, { id: root.key, ...state })
          }
        }),
      6 // "width" i.e. how many to simultaneously run in parallel
    ),
    pull.filter(Boolean), // drop profiles which has some trouble resolving
    pull.collect((err, profiles) => {
      if (err) return cb(err)

      cb(null, profiles)
    })
  )
}
