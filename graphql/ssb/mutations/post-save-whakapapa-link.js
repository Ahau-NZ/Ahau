const pick = require('lodash.pick')

module.exports = function PostSaveWhakapapaRelation (sbot) {
  return function postSaveWhakapapaRelation (input, cb) {
    const { relationshipId, child, parent } = input
    const opts = buildWhakapapaLinkOpts(input)

    if (relationshipId) {
      sbot.whakapapa.child.update(relationshipId, opts, err => {
        if (err) cb(err)
        else cb(null, relationshipId)
      })
    } else if (child && parent) {
      sbot.whakapapa.child.create({ parent, child }, opts, (err, id) => {
        if (err) cb(err)
        else cb(null, id)
      })
    } else {
      throw new Error('Invalid input')
    }
  }
}

function buildWhakapapaLinkOpts (input) {
  const permittedAttrs = ['relationshipType', 'legallyAdopted', 'recps']

  let opts = pick(input, permittedAttrs)
  Object.entries(opts).forEach(([key, value]) => {
    if (key === 'recps') return
    opts[key] = { set: value }
  })

  return opts
}
