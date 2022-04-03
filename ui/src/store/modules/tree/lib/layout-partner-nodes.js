import { RADIUS, PARTNER_RADIUS, PARTNER_SPACE } from '../constants'

export default function layoutPartnerNodes (rootNode, rootGetters) {
  const partnerIds = rootGetters['whakapapa/getPartnerIds'](rootNode.data.id)

  if (!partnerIds.length) return []

  const childNodes = rootNode.children || []
  let leftPartners = 0
  let rightPartners = 0

  function meanChildX (partnerId) {
    const partnerChildren = rootGetters['whakapapa/getChildIds'](partnerId)
      .filter(childId => rootGetters['whakapapa/getChildType'](partnerId, childId) === 'birth')
      .map(partnerChildId => childNodes.find(node => node.data.id === partnerChildId))
      // find the position of partnerId's children below the the rootNode (if it exists)
      .filter(Boolean) // filters out empty entries

    if (!partnerChildren.length) return 0
    return meanX(partnerChildren)
  }

  return partnerIds
    // sort partners by where most of their children are
    .sort((A, B) => meanChildX(A) - meanChildX(B))
    // then alternate placing them on each side (starting with left)
    .map((partnerId, i) => {
      // set partners to be on side where most of their birth children are
      // OR fall back to making it evenly placed

      let sign = -1 // default to the left
      if (leftPartners > rightPartners) { sign = 1 }

      // update the count of the partners on each side
      (sign > 0) ? rightPartners++ : leftPartners++

      const hops = (sign > 0) ? rightPartners : leftPartners
      let hopsDistance = RADIUS + PARTNER_SPACE + PARTNER_RADIUS
      if (hops > 1) hopsDistance += (hops - 1) * PARTNER_RADIUS + PARTNER_SPACE + PARTNER_RADIUS

      // how far sideways the partner sits from the root node at 0
      const x = (
        rootNode.x + // avatar center
        sign * hopsDistance
      )

      return {
        x,
        y: rootNode.y,
        data: { id: partnerId }
      }
    })
}

function meanX (nodes) {
  return (
    nodes.reduce((acc, node) => acc + node.x, 0) /
    nodes.length
  )
}
