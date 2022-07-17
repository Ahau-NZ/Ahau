export default function FindPathToRoot (getters) {
  const {
    getRawParentIds: getParentIds,
    getRawPartnerIds: getPartnerIds,
    whakapapaView
  } = getters

  function findAncestors (start, end, path) {
    if (start === end) {
      path.add(start)
      return true
    }

    const parentIds = getParentIds(start)

    return parentIds.some(parentId => {
      if (
        !findAncestors(parentId, end, path) &&
        !findPartnerAncestors(parentId, end, path)
      ) return false

      path.add(parentId)
      return true
    })
  }

  function findPartnerAncestors (start, end, path) {
    if (start === end) {
      path.add(start)
      return true
    }

    const partnerIds = getPartnerIds(start)

    return partnerIds.some(partnerId => {
      if (
        !findAncestors(partnerId, end, path) &&
        !findPartnerAncestors(partnerId, end, path)
      ) return false

      path.add(partnerId)
      return true
    })
  }

  return function findPathToRoot (start) {
    if (!start) return []

    const path = new Set([start])
    // NOTE: this path does not preserve order
    const end = whakapapaView.focus

    findAncestors(start, end, path) ||
    findPartnerAncestors(start, end, path)

    return Array.from(path)
  }
}
