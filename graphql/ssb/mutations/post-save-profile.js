const pick = require('lodash.pick')

module.exports = function PostSaveProfile (sbot) {
  return function poastSaveProfile (input, cb) {
    // TODO check permissions?
    const { id, type } = input
    const T = buildTransformation(input)

    if (id) {
      sbot.profile.update(id, T, (err, updateMsg) => {
        if (err) cb(err)
        else cb(null, id)
      })
      return
    }

    if (!type) cb(new Error('Type is required for creating a new profile'))

    sbot.profile.create(type, T, (err, profileId) => {
      if (err) cb(err)
      else cb(null, profileId)
    })
  }
}

function buildTransformation (input) {
  let T = {}

  Object.entries(input).forEach(([key, value]) => {
    switch (key) {
      case 'type':
        return
      case 'id':
        return

      case 'altNames':
        // TODO
        return

      case 'avatarImage':
        T[key] = {
          set: pick(value, ['blob', 'mimeType', 'size', 'width', 'height'])
        }
        return
      case 'headerImage':
        T[key] = {
          set: pick(value, ['blob', 'mimeType', 'size', 'width', 'height'])
        }
        return

      case 'bornAt':
        T[key] = { set: Number(value) }
        return

      case 'diedAt':
        T[key] = { set: Number(value) }
        return

      case 'tombstone':
        T[key] = { set: pick(value, ['date', 'reason']) }
        T[key].set.date = Number(T[key].set.date)
        // graphql only allows 32bit signed Ints
        // so we're passing a Date and converting it to Int for ssb
        return

      case 'recps':
        T[key] = value
        return

      default:
        T[key] = { set: value }
    }
  })

  return T
}
