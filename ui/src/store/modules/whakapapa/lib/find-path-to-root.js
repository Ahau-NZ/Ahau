export default function FindPathToRoot (getters) {
  const getParentIds = getters['whakapapa/getRawParentIds']
  const getPartnerIds = getters['whakapapa/getRawPartnerIds']

  function findAncestors (start, end, profileIds) {
    if (start === end) {
      profileIds.add(start)
      return true
    }

    const parentIds = getParentIds(start)

    return parentIds.some(parentId => {
      if (
        !findAncestors(parentId, end, profileIds) &&
        !findPartnerAncestors(parentId, end, profileIds)
      ) return false

      profileIds.add(parentId)
      return true
    })
  }

  function findPartnerAncestors (start, end, profileIds) {
    if (start === end) {
      profileIds.add(start)
      return true
    }

    const partnerIds = getPartnerIds(start)

    return partnerIds.some(partnerId => {
      if (
        !findAncestors(partnerId, end, profileIds) &&
        !findPartnerAncestors(partnerId, end, profileIds)
      ) return false

      profileIds.add(partnerId)
      return true
    })
  }

  return function findPathToRoot (start) {
    const profileIds = new Set()
    const end = getters['whakapapa/whakapapaView'].focus

    if (findAncestors(start, end, profileIds)) profileIds.add(start)
    else if (findPartnerAncestors(start, end, profileIds)) profileIds.add(start)

    return Array.from(profileIds)
  }
}
