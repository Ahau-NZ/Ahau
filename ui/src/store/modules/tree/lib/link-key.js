export default function linkKey (label, parent, child) {
  return (
    label + '-' +
    (Array.isArray(parent) ? parent.map(shortId).sort().join('+') : shortId(parent)) + '-' +
    shortId(child)
  )
}

function shortId (node) {
  if (typeof node === 'string') return node.slice(1, 9)
  return node.data.id.slice(1, 9)
}
