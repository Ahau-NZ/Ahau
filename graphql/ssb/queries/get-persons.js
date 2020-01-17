const pull = require('pull-stream')
const paraMap = require('pull-paramap')
const isProfile = require('ssb-profile/lib/is-profile')

// get all profiles (except those ones I made just for me)
module.exports = function GetPersons (sbot, getProfile) {
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

  return function getPersons (cb) {
    pull(
      sbot.query.read({ query }),
      pull.filter(isProfile),
      pull.filter(m => {
        if (!m.value.content.recps) return true
        if (
          m.value.content.recps.length === 1 &&
          m.value.content.recps[0] === sbot.id
        ) {
          return false
        }
        // exclude entries that were only encrypted to me
        return true
      }),
      pull.map(root => root.key),
      paraMap(getProfile, 5),
      pull.collect((err, profiles) => {
        if (err) return cb(err, null)
        cb(null, profiles)
      })
    )
  }
}
