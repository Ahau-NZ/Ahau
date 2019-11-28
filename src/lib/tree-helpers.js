export default {
  flatten,
  hydrate
}

function flatten (node) {
  const { children, parents } = node

  node.children = node.children.map(p => p.id)
  node.parents = node.parents.map(p => p.id)

  // here we could add more missing details to each node:
  // - could add a note of the parent to each child
  // - could add to the target who it seems like their partners have been,
  //   based on who their childrens parents are.
  //   - that should probably be in another method though (not flatten!)

  var output = { [node.id]: node }
  children.forEach(node => { output[node.id] = node })
  parents.forEach(node => { output[node.id] = node })

  return output
}

function hydrate (node, flatStore) {
  if (node.children) {
    node.children = node.children.map(id => flatStore[id])
    node.children.forEach(n => hydrate(n, flatStore))
  }
  if (node.parents) {
    node.parents = node.parents.map(id => flatStore[id])
    node.parents.forEach(n => hydrate(n, flatStore))
  }
}
