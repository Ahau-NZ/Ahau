const pick = require('lodash.pick')

module.exports = function PostSaveWhakapapaView (sbot) {
  return function postSaveWhakapapaView (input, cb) {
    const { id } = input
    const details = buildWhakakakaViewOpts(input)

    if (id) {
      sbot.whakapapa.view.update(id, details, err => {
        if (err) cb(err)
        else cb(null, id)
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
