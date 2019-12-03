const pull = require('pull-stream')
const pullParamap = require('pull-paramap')
const isRoot = require('ssb-whakapapa/lib/is-view-root')
const getView = require('./get-view')

module.exports = function profiles (sbot, cb) {
  const query = [
    {
      $filter: {
        timestamp: { $gt: 0 }, // forces order by received time
        value: {
          // timestamp: { $gt: 0 }, // forces order by asserted publish time
          content: {
            type: 'whakapapa/view',
            tangles: {
              view: { root: null, previous: null }
            }
          }
        }
      }
    }
  ]

  pull(
    sbot.query.read({ query }),
    pull.filter(isRoot),
    pullParamap(
      (root, cb) => {
        getView(sbot, root.key)
          .then(view => cb(null, view))
          .catch(_ => cb(null, null))
      },
      6 // "width" i.e. how many to simultaneously run in parallel
    ),
    pull.filter(Boolean), // drop views which has some trouble resolving
    pull.collect((err, views) => {
      if (err) return cb(err)

      cb(null, views)
    })
  )
}
