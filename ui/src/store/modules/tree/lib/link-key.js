export default function linkKey (label, ...args) {
  // args[i] - either String, or [String]

  // e.g.
  //   linkKey('child', parentId, childId)
  //   linkKey('child', [parentA, parentB], childId)
  //   linkKey('partner', [parentA, parentB])

  return args.reduce(
    (acc, arg) => (
      acc +
      '-' +
      (
        (Array.isArray(arg) && arg.map(shortId).sort().join('+')) ||
        shortId(arg)
      )
    ),
    label
  )
}

function shortId (node) {
  if (typeof node === 'string') return node.slice(1, 9)
  return node.data.id.slice(1, 9)
}
