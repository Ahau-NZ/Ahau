import clone from 'lodash.clonedeep'
import uniqby from 'lodash.uniqby'

export default {
  flatten,
  hydrate,
  find,

  getPartners,
  getSiblings,
  getRelationship,

  updateNode,
  deleteNode,
  addChild,
  addParent,

  addPartner,
  updatePartner,
  addChildToPartner,
  deletePartnerNode
}

function flatten (node) {
  const { children, parents } = node
  // currently ignores e.g. childNode.relationshipType childNode.legallyAdopted

  const flatNode = Object.assign({}, node, {
    children: children.map(p => p.profile.id),
    parents: parents.map(p => p.profile.id)
  })

  var output = {
    [node.id]: flatNode
  }
  children.forEach(person => {
    output[person.profile.id] = person.profile
  })
  parents.forEach(person => {
    output[person.profile.id] = person.profile
  })

  // NOTE these children + parent entries have Person data, but dont't yet
  // have associated children/ parent records

  return output
}

function hydrate (node, flatStore) {
  var output = clone(node)

  if (output.children) {
    output.children = output.children.map(profileId => {
      // look up the full record to replace the profileId
      var profile = flatStore[profileId]
      profile = hydrate(profile, flatStore)
      return profile
    })
    output.children.sort((a, b) => {
      return a.birthOrder - b.birthOrder
    })
  }

  if (output.parents) {
    output.siblings = []
    output.parents = output.parents.map(profileId => {
      // look up the full record to replace the profileId
      var profile = flatStore[profileId]

      if (profile.children) {
        const currentSiblings = profile.children.map(d => {
          return d
        })

        const siblings = new Set([...currentSiblings, ...output.siblings])
        siblings.delete(output.id) // remove the current profile from this
        output.siblings = Array.from(siblings)
      }
      return profile
    })
  }

  if (output.siblings) {
    output.siblings = output.siblings.map(profileId => {
      var profile = flatStore[profileId]
      return profile
    })
  }

  if (output.partners) {
    output.partners = output.partners.map(profileId => {
      var profile = flatStore[profileId]
      return profile
    })
  }
  return output
}

/*
  calculates the siblings of a given child based on children of the given parent
  and returns the child with the new siblings
*/
function getSiblings (parent, child) {
  if (!child.siblings) child.siblings = []

  if (parent && parent.children) {
    parent.children.forEach(sibling => {
      if (sibling.profile) {
        if (sibling.profile.id !== child.id) {
          child.siblings.map((d, i) => {
            if (d.id === sibling.profile.id) {
              child.siblings.splice(i, 1)
            }
          })
          child.siblings.push(sibling.profile)
        }
      } else {
        if (sibling.id !== child.id) {
          child.siblings.map((d, i) => {
            if (d.id === sibling.id) {
              child.siblings.splice(i, 1)
            }
          })
          child.siblings.push(sibling)
        }
      }
    })
  }
  // do not allow duplicates
  child.siblings = uniqby(child.siblings, 'id')
  return child
}

/*
  calculates the partners of a given parent based on the parents of the given child
  and returns the parent with the new partners
*/
function getPartners (parent, child) {
  if (!parent.partners) parent.partners = []
  if (child.parents) {
    child.parents.forEach(partner => {
      if (partner.profile) {
        partner = partner.profile
      }
      if (partner.id !== parent.id && !parent.partners.find(d => d.id === partner.id)) {
        parent.partners.push(partner)
      }
    })
  }
  // do not allow duplicates
  parent.partners = uniqby(parent.partners, 'id')
  return parent
}

/*
  calulates a relationship object for the given parent and child. The index
  stating what index in the tree it goes in and the attrs are what attributes
  to store at that index
*/
function getRelationship (parent, child, relationship) {
  return {
    index: parent.id + '-' + child.id, // index in the relationshipLinks map
    attrs: {
      linkId: relationship.linkId,
      relationshipType: relationship.relationshipType,
      parent: parent.id,
      child: child.id
    }
  }
}

/*
  searches through the nestedWhakapapa to find
  the profile by id and updates their personal
  details but not their children
  NOTE: cannot be used for partners see below
*/
function updateNode (nestedWhakapapa, node) {
  // if the nestedWhakapapa has no value
  // then we can search it
  if (isEmpty(nestedWhakapapa)) return {}

  // if the nestedWhakapapa matches the node we are
  // looking for, then look no further
  if (nestedWhakapapa.id === node.id) {
    // update its value
    nestedWhakapapa = node
    return nestedWhakapapa
  }
  // if this nestedWhakapap isnt the one we are looking for,
  // try searching its children
  nestedWhakapapa.children = nestedWhakapapa.children.map(child => {
    // do the same for each child
    return updateNode(child, node) // will either return a changed value or the same one
  })

  return nestedWhakapapa
}

function isEmpty (d) {
  return d === undefined || d === null || Object.keys(d).length === 0
}

/*
  searches through the nestedWhakapapa to find
  the profile by id and removes them and all their decendants
*/
function deleteNode (nestedWhakapapa, id) {
  // if the nestedWhakapapa has no value
  // then we can search it
  if (!nestedWhakapapa) return null
  // if the nestedWhakapapa matches the id we are
  // looking for, then look no further
  if (nestedWhakapapa.id === id) {
    // found the node we need to delete
    if (nestedWhakapapa.parents.length) return null
    else if (nestedWhakapapa.partners.length) {
      nestedWhakapapa.partners[0].partners.forEach((d, i) => {
        if (id === d.id) {
          nestedWhakapapa.partners[0].partners.splice(i, 1)
        }
      })
      return nestedWhakapapa.partners[0]
    } else return nestedWhakapapa.children[0]
  }
  // if this nestedWhakapap isnt the one we are looking for,
  // try searching its children
  var childIndex = -1
  nestedWhakapapa.children.some((child, i) => {
    var node = deleteNode(child, id)
    if (node === null) {
      childIndex = i
      return true
    }
  })
  // if an index was set
  if (childIndex > -1) {
    // remove that child
    nestedWhakapapa.children.splice(childIndex, 1)
  }

  return nestedWhakapapa
}

/*
  searches the nestedWhakapapa for the parent with matching id
  and removes them
*/
function deletePartnerNode (nestedWhakapapa, id) {
  if (!nestedWhakapapa) return null

  var partnerIndex = -1
  // check the partners of the current nestedWhakapapa
  if (nestedWhakapapa.partners) {
    nestedWhakapapa.partners.some((partner, i) => {
      if (partner.id === id) {
        partnerIndex = i
        return true
      }
    })
  }

  if (partnerIndex > -1) {
    // the partner was found here
    nestedWhakapapa.partners.splice(partnerIndex, 1)
    // remove this parent from the children
    nestedWhakapapa.children.forEach(child => {
      child.parents.forEach((parent, i) => {
        if (parent.id === id) {
          child.parents.splice(i, 1)
        }
      })
      return child
    })
    return nestedWhakapapa
  }

  // didnt find them here so look in children instead
  nestedWhakapapa.children = nestedWhakapapa.children.map(child => {
    // do the same for each child
    return deletePartnerNode(child, id) // will either return a changed value or the same one
  })
  return nestedWhakapapa
}

function updatePartner (nestedWhakapapa, node) {
  // if the nestedWhakapapa has no value
  // then we can search it
  if (!nestedWhakapapa) return null

  // if the nestedWhakapapa matches the node we are
  // looking for, then look no further
  var partnerIndex = -1
  nestedWhakapapa.partners.some((d, i) => {
    if (d.id === node.id) {
      partnerIndex = i
      return true
    }
  })

  if (partnerIndex > -1) {
    // partner was found so lets update their value
    nestedWhakapapa.partners[partnerIndex] = node

    // need to update the children as well
    nestedWhakapapa.children = nestedWhakapapa.children.map(child => {
      child.parents = child.parents.map(parent => {
        if (parent.id === node.id) return node
        return parent
      })
      return child
    })

    return nestedWhakapapa
  }

  // if this nestedWhakapapa partners didnt have the one we are looking for,
  // try searching its children
  nestedWhakapapa.children = nestedWhakapapa.children.map(child => {
    // do the same for each child
    return updatePartner(child, node) // will either return a changed value or the same one
  })

  return nestedWhakapapa
}

function addChild (nestedWhakapapa, child, parent) {
  if (!nestedWhakapapa) return null
  if (nestedWhakapapa.id === parent.id) {
    nestedWhakapapa.children = nestedWhakapapa.children.map(d => {
      if (!d.siblings) d.siblings = []
      d.siblings.push(child)
      return d
    })
    nestedWhakapapa.children.push(child)
    return nestedWhakapapa
  }

  nestedWhakapapa.children = nestedWhakapapa.children.map(c => {
    // do the same for each child
    return addChild(c, child, parent) // will either return a changed value or the same one
  })

  return nestedWhakapapa
}

function addChildToPartner (nestedWhakapapa, child, partner) {
  // if the nestedWhakapapa has no value
  // then we can search it
  if (!nestedWhakapapa) return null

  // if the nestedWhakapapa matches the node we are
  // looking for, then look no further
  nestedWhakapapa.partners = nestedWhakapapa.partners.map((d, i) => {
    if (d.id === partner.id) {
      d.children = d.children.map(c => {
        if (!c.siblings) c.siblings = []
        c.siblings.push(child)
        return c
      })
      d.children.push(child)
    }
    return d
  })

  // if this nestedWhakapapa partners didnt have the one we are looking for,
  // try searching its children
  nestedWhakapapa.children = nestedWhakapapa.children.map(c => {
    // do the same for each child
    return addChildToPartner(c, child, partner) // will either return a changed value or the same one
  })

  return nestedWhakapapa
}

function addParent (nestedWhakapapa, child, parent) {
  if (!nestedWhakapapa) return null
  if (nestedWhakapapa.id === child.id) {
    nestedWhakapapa.parents.push(parent)
    return nestedWhakapapa
  }

  var found = false
  nestedWhakapapa.children = nestedWhakapapa.children.map(c => {
    if (c.id === child.id) found = true
    return addParent(c, child, parent)
  })

  if (found) {
    if (nestedWhakapapa.partners.length === 0) nestedWhakapapa.partners.push(parent)
    else {
      if (!nestedWhakapapa.partners.some(p => p.id === parent.id)) {
        nestedWhakapapa.partners.push(parent)
      }
    }
  }

  return nestedWhakapapa
}

function addPartner (nestedWhakapapa, node, partner) {
  if (!nestedWhakapapa) return null
  if (nestedWhakapapa.id === node.id) {
    if (!nestedWhakapapa.partners) nestedWhakapapa.partners = []
    nestedWhakapapa.partners.push(partner)
    return nestedWhakapapa
  }

  // TODO: do we need to add this partner to anyone else

  return nestedWhakapapa
}

// TODO: rename this function
function find (nestedWhakapapa, node) {
  if (!nestedWhakapapa) return null
  if (nestedWhakapapa.id === node) {
    return nestedWhakapapa
  }

  for (var child of nestedWhakapapa.children) {
    var found = this.find(child, node)
    if (found) return found
  }

  return null
}
