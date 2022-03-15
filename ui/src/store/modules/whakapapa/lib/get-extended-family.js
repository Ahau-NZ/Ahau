export default function GetExtendedFamily (state, getters) {
  const {
    getRawChildIds, getRawParentIds, getRawPartnerIds,
    getChildType,
    isImportantLink, isNotIgnored
  } = getters

  return function getExtendedFamily (parentIds, opts = {}) {
    if (typeof parentIds === 'string') return getExtendedFamily([parentIds], opts)
    if (opts.linkHelper) opts.linkHelper.adult.resetNew()

    const {
      // lineage = new Set(),
      linkHelper = LinkStateHelper(parentIds[0])
    } = opts

    // parentIds.forEach(parentId => lineage.add(parentId))

    /* search: parent-->childen-->otherParents */
    parentIds.forEach(parentId => processParent(parentId, linkHelper))

    /* search: parent-->partner */
    parentIds
      .flatMap(getRawPartnerIds)
      .filter(isNotIgnored)
      // .filter( ... isImportantLink)
      .forEach(linkHelper.adult.add)

    const newAdults = linkHelper.adult.new
    // .filter(id => !lineage.has(id))

    // decide if we're going around for another round!
    if (newAdults.length) return getExtendedFamily(newAdults, { linkHelper }) // , lineage }
    else return linkHelper.output // DONE!
  }

  function processParent (parentId, linkHelper) {
    if (!isNotIgnored(parentId)) return

    getRawChildIds(parentId)
      .filter(isNotIgnored)
      .filter(childId => isImportantLink(childId, parentId))
      .forEach(childId => {
        // record the children
        linkHelper.child.add(childId)

        getRawPartnerIds(childId)
          .forEach(linkHelper.childPartner.add)

        if (getChildType(parentId, childId) !== 'birth') return

        getRawParentIds(childId)
          .filter(isNotIgnored)
          .filter(otherParentId => !linkHelper.adult.has(otherParentId))
          .filter(otherParentId => isImportantLink(childId.child, otherParentId))
          // NOTE we protect against strange side-effects whangai links can have
          // Check the otherParent you've found is not a parent of a parentId you're investigating
          // and they're not a child of their parentId you're investigating
          .filter(otherParentId => (
            getChildType(otherParentId, parentId) === undefined &&
            getChildType(parentId, otherParentId) === undefined
            // this just checks immediate parents, ideally we would search through all ascendants
          ))
          // record the new adults found
          .forEach(linkHelper.adult.add)
      })
  }
}

function LinkStateHelper (targetId) {
  const adults = new Set([targetId]) // i.e. of parent generation, not child generation
  const newAdults = new Set([])
  const children = new Set([]) // i.e. of child generation
  const childrenPartners = new Set([]) // sometimes we find a person who appers to be an adult, but because of a whangai is actually of the child generation

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
    childPartner: {
      add (childId) {
        childrenPartners.add(childId)
      }
    },
    get output () {
      const partners = new Set([...adults, ...newAdults])
      partners.delete(targetId)

      return {
        partners: Array.from(partners).filter(partnerId => !childrenPartners.has(partnerId)),
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
