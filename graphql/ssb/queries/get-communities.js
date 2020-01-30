const pull = require('pull-stream')
const paraMap = require('pull-paramap')
const isProfile = require('ssb-profile/lib/is-profile.js')

module.exports = function GetCommunities (sbot, getProfile) {
  const query = [
    {
      $filter: {
        timestamp: { $gt: 0 }, // forces order by received time
        value: {
          // timestamp: { $gt: 0 }, // forces order by asserted publish time
          content: {
            type: 'profile/community',
            tangles: {
              profile: { root: null, previous: null }
            }
          }
        }
      }
    }
  ]

  return function getCommunities (cb) {
    pull(
      sbot.query.read({ query }),
      pull.filter(isProfile),
      pull.map(root => root.key),
      paraMap(getProfile, 6),
      pull.filter(Boolean), // drop profiles which has some trouble resolving
      pull.collect((err, profiles) => {
        if (err) return cb(err)

        cb(null, profiles)
      })
    )
  }
}
