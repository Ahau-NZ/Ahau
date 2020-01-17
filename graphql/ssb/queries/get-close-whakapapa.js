const pull = require('pull-stream')
const paraMap = require('pull-paramap')

module.exports = function GetCloseWhakapapa (sbot, getProfile) {
  return function getCloseWhakapapa (profileId, type, cb) {
    sbot.whakapapa.get(profileId, (err, whakapapa) => {
      if (err) return cb(err)
      let result = {}
      pull(
        pull.values(prune(whakapapa[type])),
        pull.map(profile => {
          result[profile.profileId] = profile
          return profile.profileId
        }),
        paraMap(getProfile, 4),
        pull.filter(profile => profile.tombstone === null),
        pull.map(profile => ({
          profile,
          relationshipType: result[profile.id].relationshipType,
          legallyAdopted: result[profile.id].legallyAdopted
        })),
        pull.collect((err, profiles) => {
          if (err) cb(err)
          else cb(null, profiles)
        })
      )
    })
  }
}

function prune (nodes) {
  // it's possible for there to be multiple relationship/child messages
  // connected two nodes, but that duplication is not desireable in the UI
  // so here we remove the duplicates

  return nodes.reduce((acc, curr) => {
    const existingIndex = acc.findIndex(
      oldWhakapapa => oldWhakapapa.profileId === curr.profileId
    )
    if (existingIndex === -1) return acc.concat(curr)

    let newArray = acc.map(whakapapa => {
      let newObject = {}
      Object.entries(whakapapa).forEach(([whakapapaKey, whakapapaValue]) => {
        if (curr[whakapapaKey]) {
          newObject[whakapapaKey] = curr[whakapapaKey]
        } else {
          newObject[whakapapaKey] = whakapapaValue
        }
      })
      return newObject
    })
    return newArray
  }, [])
}
