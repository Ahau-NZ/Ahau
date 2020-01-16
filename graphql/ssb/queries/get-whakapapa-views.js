const pull = require('pull-stream')
const pullParamap = require('pull-paramap')
const isRoot = require('ssb-whakapapa/lib/is-view-root')

module.exports = function GetWhakapapaViews (sbot, getWhakapapaView) {
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
  return function getWhakapapaViews (cb) {
    pull(
      sbot.query.read({ query }),
      pull.filter(isRoot),
      pull.map(root => root.key),
      pullParamap(getWhakapapaView, 6),
      pull.filter(Boolean), // drop views which has some trouble resolving
      pull.collect((err, views) => {
        if (err) return cb(err)
        cb(null, views)
      })
    )
  }
}
