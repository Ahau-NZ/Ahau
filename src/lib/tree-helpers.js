import clone from 'lodash.clonedeep'

export default {
  flatten,
  hydrate
}

function flatten (node) {
  const { children, parents } = node

  const flatNode = Object.assign(
    {},
    node,
    {
      children: node.children.map(p => p.id),
      parents: node.parents.map(p => p.id)
    }
  )
  // node.children = node.children.map(p => p.id)
  // node.parents = node.parents.map(p => p.id)

  var output = { [node.id]: flatNode }
  children.forEach(node => { output[node.id] = node })
  parents.forEach(node => { output[node.id] = node })
  // NOTE these children + parent entries have profile data but not their own children / parent records (yet)
  // we could pre-emptively add child / parent data about the current node to the

  return output
}

function hydrate (node, flatStore) {
  var output = clone(node)

  if (output.children) {
    output.children = output.children
      .map(profileId => {
        // look up the full record to replace the profileId
        var profile = flatStore[profileId]
        profile = hydrate(profile, flatStore)
        return profile
      })
  }

  if (output.bornAt) {
    output.bornAt = output.bornAt.slice(0, 10)
  }

  if (output.parents) {
    output.siblings = []
    output.parents = output.parents
      .map(profileId => {
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
    output.siblings = output.siblings
      .map(profileId => {
        var profile = flatStore[profileId]
        return profile
      })
  }

  if (output.partners) {
    output.partners = output.partners
      .map(profileId => flatStore[profileId])
  }
  return output
}
