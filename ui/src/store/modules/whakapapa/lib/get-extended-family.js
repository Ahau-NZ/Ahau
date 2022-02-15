export default function getExtendedFamily (state, getters, parentIds, opts = {}) {
  if (opts.linkHelper) opts.linkHelper.adult.resetNew()

  const {
    // lineage = new Set(),
    linkHelper = LinkStateHelper(parentIds[0])
  } = opts

  const {
    getRawChildIds, getRawParentIds, getRawPartnerIds,
    getChildRelationshipType,
    isNotIgnored
  } = getters

  const isImportantLink = (childId, parentId) => (
    // keep that parent if there's:
    // EITHER an importantRelationship with the child
    getters.isImportantLink(childId, parentId) ||
    // OR this parents partner has an importantRelationship with the child
    getRawPartnerIds(parentId).some(partnerId => getters.isImportantLink(childId, partnerId))
  )

  // parentIds.forEach(parentId => lineage.add(parentId))

  /* child-parent look-around */
  parentIds
    .filter(isNotIgnored)
    .forEach(parentId => {
      getRawChildIds(parentId)
        // .filter(otherParentId => !linkHelper.child.has(otherParentId))
        .filter(isNotIgnored)
        .filter(childId => isImportantLink(childId, parentId))
        .forEach(childId => {
          linkHelper.child.add(childId)

          getRawParentIds(childId)
            .filter(isNotIgnored)
            .filter(otherParentId => !linkHelper.adult.has(otherParentId))
            .filter(otherParentId => isImportantLink(childId, otherParentId))
            // NOTE following protects against some strange side-effects whangai links can have
            // Check the otherParent you've found is not a parent of a parentId you're investigating
            // and they're not a child of their parentId you're investigating
            .filter(otherParentId => (
              getChildRelationshipType(otherParentId, parentId) === undefined &&
              getChildRelationshipType(parentId, otherParentId) === undefined
              // this just checks immediate parents, ideally we would search through all ascendants
            ))
            .forEach(linkHelper.adult.add)
        })
    })

  /* partner-partner look-around */
  parentIds.forEach(parentId => {
    getRawPartnerIds(parentId)
      .filter(isNotIgnored)
      // .filter(childId => isImportantLink(childId, parentId))
      .forEach(linkHelper.adult.add)
  })

  const newAdults = linkHelper.adult.new
  // .filter(id => !lineage.has(id))

  // decide if we're going around for another round!
  if (!newAdults.length) return linkHelper.output
  else {
    // console.log('recursing', { newAdults })
    return getExtendedFamily(state, getters, newAdults, { linkHelper }) // , lineage })
  }
}

function LinkStateHelper (targetId) {
  const adults = new Set([targetId]) // i.e. of parent generation, not child generation
  const newAdults = new Set([])
  const children = new Set([]) // i.e. of child generation

  return {
    adult: {
      add (parentId) {
        if (adults.has(parentId)) return
        if (children.has(parentId)) return
        // you cannot add someone to the list of adults if they are already in the list of children

        newAdults.add(parentId)
      },
      has (parentId) {
        return adults.has(parentId) || newAdults.has(parentId)
      },
      get new () {
        return Array.from(newAdults)
      },
      resetNew () {
        newAdults.forEach(adult => adults.add(adult))
        newAdults.clear()
      }
    },
    child: {
      add (childId) {
        if (adults.has(childId) || newAdults.has(childId)) return

        children.add(childId)
      },
      has (parentId) {
        return children.has(parentId)
      }
    },
    get output () {
      const partners = new Set([...adults, ...newAdults])
      partners.delete(targetId)

      return {
        partners: Array.from(partners),
        children: Array.from(children)
        // NOTE these are "graphChildren" and "graphPartners"
      }
    }
  }
}
// usage:
//   register the links
//   ask if newAdults
//   resetNewAdults
//   repeat
