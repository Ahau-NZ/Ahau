export default {
  find
}

// TODO: rename this function
function find (nestedWhakapapa, node) {
  if (!nestedWhakapapa) return null
  if (nestedWhakapapa.id === node) {
    return nestedWhakapapa
  }

  if (nestedWhakapapa.children) {
    for (var child of nestedWhakapapa.children) {
      var found = this.find(child, node)
      if (found) return found
    }
  }

  return null
}
