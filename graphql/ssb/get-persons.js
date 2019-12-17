const pull = require('pull-stream')
const pullParamap = require('pull-paramap')
const isProfile = require('ssb-profile/lib/is-profile')
const getProfile = require('./get-profile')

// get all profiles (excpet those ones I made just for me)
module.exports = function getPersons (sbot, cb) {
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

    pull.filter(m => {
      if (!m.value.content.recps) return true
      if (m.value.content.recps.length === 1 && m.value.content.recps[0] === sbot.id) return false
      // exclude entries that were only encrypted to me
      return true
    }),

    pullParamap(
      (root, cb) => {
        getProfile(sbot, root.key)
          .then(profile => cb(null, profile))
          .catch(_ => cb(null, null))
      },
      6 // "width" i.e. how many to simultaneously run in parallel
    ),
    pull.filter(Boolean), // drop profiles which has some trouble resolving

    pull.collect((err, profiles) => {
      if (err) return cb(err)

      cb(null, profiles)
    })
  )
}