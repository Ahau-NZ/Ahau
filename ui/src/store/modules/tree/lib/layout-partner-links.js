import linkStyle from './link-style'
import linkKey from './link-key'
import settings from '../../../../lib/link'

const Y_GAP = 5

export default function layoutPartnerLinks (rootNode, { getPartnerType }) {
  if (!rootNode.partners) throw new Error('missing partners')

  return rootNode.partners.reduce((acc, partnerNode, i) => {
    const type = getPartnerType(rootNode, partnerNode)
    if (!['partners', 'inferred'].includes(type)) return acc

    // the position the link sits on, on the Y axis
    const partnerLinkY = rootNode.y + (i * Y_GAP)

    acc.push({
      key: linkKey('partner', [rootNode, partnerNode]),
      y: partnerLinkY,

      // draws horizontal link from root --- partner
      d: `
        M ${rootNode.x}, ${partnerLinkY}
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
