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
      .map(profileId => hydrate(flatStore[profileId], flatStore))
  }

  if (output.partners) {
    output.partners = output.partners
      .map(profileId => flatStore[profileId])
  }

  // if (node.parents) {
  //   careful, infinite recursion!
  //   would need to add a "seen this" tracker
  // }

  return output
}
