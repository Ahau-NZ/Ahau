import { RADIUS, PARTNER_RADIUS, PARTNER_SPACE } from '../constants'

function findMidway (length) {
  if (length === 1) return 1
  if (length % 2 === 0) return length / 2

  return Math.floor(length / 2)
}

export default function layoutPartnerNodes (rootNode, rootGetters) {
  const partnerIds = rootGetters['whakapapa/getPartnerIds'](rootNode.data.id)
  if (!partnerIds.length) return []

  const childNodes = rootNode.children || []
  const midway = findMidway(partnerIds.length)
  var leftPartners = 0
  var rightPartners = 0

  return partnerIds.map((partnerId, i) => {
    // set partners to alternate sides
    let sign = (i >= midway) ? 1 : -1

    const partnerChildIds = rootGetters['whakapapa/getChildIds'](partnerId)

    if (partnerChildIds.length) {
      // find the position of partnerId's children below the the rootNode
      // and place the partnerId on the correct side (adjust the sign)
      const partnersChildNodes = partnerChildIds
        .map(partnerChildId => childNodes.find(node => node.data.id === partnerChildId))
        .filter(Boolean) // filters out empty entries

      const averageX = (
        partnersChildNodes.reduce((acc, childNode) => acc + childNode.x, 0) /
        partnersChildNodes.length
      )

      if (averageX) sign = (averageX > rootNode.x) ? 1 : -1
    }

    // keep a count of the partners on each side
    (sign > 0) ? rightPartners++ : leftPartners++

    // VESIGAL CODE??!
    // if (!rootGetters['whakapapa/showExtendedFamily']) {
    //   partnerChildIds = partnerChildIds.filter(childId => {
    //     return childNodes.some(childNode => childNode.data.id === childId)
    //   }) // filter out children who arent this nodes
    // }

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

// LEFTOVERS
//
// partner style
// NOTE: children of this partner will inherit this style
// const style = {
//   ...DEFAULT_STYLE,
//   stroke: settings.color.getColor(i)
// }

// // start point of the partner node links on the Y axist
// const xOffset = xMultiplier * X_PADDING
// const yOffset = rootNode.y + (i * settings.partner.spacing.y) + RADIUS

// let link = {}
// const rel = rootGetters['whakapapa/getPartnerRelationshipType'](rootNode.data.id, partnerId)
// const isPartnersPlus = ['partners', 'inferred'].includes(rel)
// // "plus" because includes inferred
// if (isPartnersPlus) {
//   link = {
//     style: {
//       ...DEFAULT_STYLE,
//       stroke: settings.color.getColor(i),
//       strokeDasharray: rel === 'inferred' ? 4 : 0 // for drawing a isDashed link
//     },
//     // for drawing the link from the root partner to this partner/partner
//     d: `
//       M ${rootNode.x + RADIUS}, ${yOffset}
//       H ${x + PARTNER_RADIUS}
//     `
//   }
// }

// return {
//   x,
//   y,
//   data: { id: partnerId },
//   children: partnerChildIds
//     .map(childId => mapChild({ x, y, sign, center: isPartnersPlus, yOffset, xOffset }, childId, style, partnerId))
//     .filter(Boolean),
//   link
// }
