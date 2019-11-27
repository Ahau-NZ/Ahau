const getProfile = require('./profile')

const fetchWhakapapa = (sbot, id) => new Promise((resolve, reject) => {
  return sbot.whakapapa.get(id, (err, data) => {
    if (err) return reject(err)
    return resolve(data)
  })
})

module.exports = async (sbot, id, profileId) => {
  function reduceWhakapapaNode (nodes) {
    return nodes.reduce((acc, curr) => {
      const existingIndex = acc.findIndex(oldWhakapapa => oldWhakapapa.profileId === curr.profileId)
      if (existingIndex === -1) {
        return acc.concat(curr)
      } else {
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
      }
    }, [])
  }
  if (!id) {
    id = profileId
  }
  try {
    const whakapapa = await fetchWhakapapa(sbot, id)
    let response = await getProfile(sbot, id)
    const reducedParents = await reduceWhakapapaNode(whakapapa.parents)
    const reducedChildren = await reduceWhakapapaNode(whakapapa.children)
    response.parents = await reducedParents.map(async parent => {
      return getProfile(sbot, parent.profileId)
    })
    response.children = await reducedChildren.map(async child => {
      return getProfile(sbot, child.profileId)
    })
    return response
  } catch (err) {
    return err
  }
}