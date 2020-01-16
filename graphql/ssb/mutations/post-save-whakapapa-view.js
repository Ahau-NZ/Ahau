const pick = require('lodash.pick')

module.exports = function PostSaveWhakapapaView (sbot) {
  return function postSaveWhakapapaView (input, cb) {
    const { viewId } = input
    const details = buildWhakakakaViewOpts(input)

    if (viewId) {
      sbot.whakapapa.view.update(viewId, details, err => {
        if (err) cb(err)
        else cb(null, viewId)
      })
    } else {
      sbot.whakapapa.view.create(details, (err, id) => {
        if (err) cb(err)
        else cb(null, id)
      })
    }
  }
}

function buildWhakakakaViewOpts (input) {
  const permittedAttrs = ['name', 'description', 'focus', 'mode', 'recps']
  // NOTE recps will be ignored in updates

  let details = pick(input, permittedAttrs)
  Object.entries(details).forEach(([key, value]) => {
    if (key === 'recps') return
    details[key] = { set: value }
  })

  return details
}
