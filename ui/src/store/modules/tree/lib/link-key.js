export default function linkKey (label, ...nodes) {
  return `${label}-${nodes.map(shortId).join()}`
}

function shortId (node) {
  return node.data.id.slice(1, 9) + node.x
}
