import { RADIUS, PARTNER_RADIUS, PARTNER_SPACE } from '../constants'

export default function layoutPartnerNodes (rootNode, rootGetters) {
  const partnerIds = rootGetters['whakapapa/getPartnerIds'](rootNode.data.id)
  if (!partnerIds.length) return []

  const childNodes = rootNode.children || []
  let leftPartners = 0
  let rightPartners = 0

  return partnerIds.map((partnerId, i) => {
    // set partners to be on side where most of their birth children are
    // OR fall back to making it evenly placed

    const partnerChildren = rootGetters['whakapapa/getChildIds'](partnerId)
      .filter(childId => rootGetters['whakapapa/getChildRelationshipType'](partnerId, childId) === 'birth')
      .map(partnerChildId => childNodes.find(node => node.data.id === partnerChildId))
      // find the position of partnerId's children below the the rootNode (if it exists)
      .filter(Boolean) // filters out empty entries

    let sign
    if (partnerChildren.length) {
      const mean = meanX(partnerChildren)
      if (mean > rootNode.x) sign = 1
      else if (mean < rootNode.x) sign = -1
    }
    if (!sign) {
      if (leftPartners < rightPartners) sign = -1
      else if (leftPartners > rightPartners) sign = 1
      else sign = -1 // default to the left
    }

    // keep a count of the partners on each side
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
