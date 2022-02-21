import linkStyle from './link-style'
import { RADIUS, PARTNER_RADIUS } from '../constants'
import settings from '../../../../lib/link'

export default function layoutPartnerLinks (rootNode, rootGetters) {
  if (!rootNode.partners) throw new Error('missing partners')

  return rootNode.partners.reduce((acc, partnerNode, i) => {
    const type = rootGetters['whakapapa/getPartnerRelationshipType'](rootNode.data.id, partnerNode.data.id)
    if (!['partners', 'inferred'].includes(type)) return acc

    acc.push({
      key: `partner-link-${shortId(rootNode)}-${shortId(partnerNode)}`,
      // draws horizontal link from root --- partner
      d: `
        M ${rootNode.x + RADIUS}, ${rootNode.y + RADIUS}
        H ${partnerNode.x + PARTNER_RADIUS}
      `,
      style: linkStyle({
        stroke: settings.color.getColor(i),
        strokeDasharray: type === 'inferred' ? 4 : 0 // for drawing a isDashed link
      })
    })

    return acc
  }, [])
}

function shortId (node) {
  return node.data.id.slice(1, 9)
}
