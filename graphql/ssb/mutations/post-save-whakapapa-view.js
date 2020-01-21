const pick = require('lodash.pick')
const permittedAttrs = ['name', 'description', 'focus', 'mode', 'image', 'recps']

module.exports = function PostSaveWhakapapaView (sbot) {
  return function postSaveWhakapapaView (input, cb) {
    const { id } = input
    const T = buildTransformation(input)

    if (id) {
      sbot.whakapapa.view.update(id, T, err => {
        if (err) cb(err)
        else cb(null, id)
      })
    } else {
      sbot.whakapapa.view.create(T, (err, id) => {
        if (err) cb(err)
        else cb(null, id)
      })
    }
  }
}

function buildTransformation (input) {
  let T = pick(input, permittedAttrs)
  // NOTE recps will be ignored in updates

  Object.entries(T).forEach(([key, value]) => {
    switch (key) {
      case 'recps': return
      case 'image':
        T[key] = { set: pick(value, ['blob', 'mimeType', 'size', 'width', 'height', 'uri']) }
        return
      default:
        T[key] = { set: value }
    }
  })

  return T
}
