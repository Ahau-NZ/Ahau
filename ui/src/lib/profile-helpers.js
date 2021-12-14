export function pruneEmptyValues (input) {
  const pruned = {}
  Object.entries(input).forEach(([key, value]) => {
    if (Array.isArray(value) && !value.length) return
    if (typeof value === 'object' && value === {}) return
    if (value !== null) pruned[key] = value
  })

  return pruned
}
