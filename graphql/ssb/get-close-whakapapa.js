const getProfile = require('./get-profile')

module.exports = async function closeWhakapapa (sbot, profileId) {
  try {
    const whakapapa = await fetchCloseWhakapapa(sbot, profileId)
    let profile = await getProfile(sbot, profileId)

    const reducedParents = prune(whakapapa.parents)
    const reducedChildren = prune(whakapapa.children)

    profile.parents = await Promise.all(
      reducedParents.map(async parent => getProfile(sbot, parent.profileId))
    )
    profile.parents = profile.parents.filter(isPreTomb)

    profile.children = await Promise.all(
      reducedChildren.map(async parent => getProfile(sbot, parent.profileId))
    )
    profile.children = profile.children.filter(isPreTomb)

    return profile
  } catch (err) {
    return err
  }
}

const fetchCloseWhakapapa = (sbot, id) => new Promise((resolve, reject) => {
  return sbot.whakapapa.get(id, (err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

function prune (nodes) {
  // it's possible for there to be multiple relationship/child messages
  // connected two nodes, but that duplication is not desireable in the UI
  // so here we remove the duplicates

  return nodes.reduce((acc, curr) => {
    const existingIndex = acc.findIndex(oldWhakapapa => oldWhakapapa.profileId === curr.profileId)
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

function isPreTomb (profile) {
  return profile.tombstone === null
}
