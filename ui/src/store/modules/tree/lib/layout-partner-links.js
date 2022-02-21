import linkStyle from './link-style'
import linkKey from './link-key'
import settings from '../../../../lib/link'

export default function layoutPartnerLinks (rootNode, rootGetters) {
  if (!rootNode.partners) throw new Error('missing partners')

  return rootNode.partners.reduce((acc, partnerNode, i) => {
    const type = rootGetters['whakapapa/getPartnerRelationshipType'](rootNode.data.id, partnerNode.data.id)
    if (!['partners', 'inferred'].includes(type)) return acc

    acc.push({
      key: linkKey('partner', rootNode, partnerNode),
      // draws horizontal link from root --- partner
      d: `
        M ${rootNode.x}, ${rootNode.y}
        H ${partnerNode.x}
      `,
      style: linkStyle({
        stroke: settings.color.getColor(i),
        strokeDasharray: type === 'inferred' ? 4 : 0 // for drawing a isDashed link
      })
    })

    return acc
  }, [])
}
