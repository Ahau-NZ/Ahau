import linkStyle from './link-style.mjs'
import linkKey from './link-key.mjs'
// import offsetIncrement from './offset-increment'
import settings from '../../../../lib/link.mjs'

const Y_GAP = 10

export default function layoutPartnerLinks (rootNode, { getPartnerType }) {
  if (!rootNode.partners) throw new Error('missing partners')

  const isDrawnLink = (partnerNode) => {
    switch (getPartnerType(rootNode, partnerNode)) {
      case 'partners': return true
      case 'inferred': return true
      default: return false
    }
  }

  return rootNode.partners
    .filter(isDrawnLink)
    .reduce((acc, partnerNode, i, partners) => {
      // the position the link sits on, on the Y axis
      const partnerLinkY = rootNode.y + (i * Y_GAP) - (partners.length / 2 * Y_GAP)

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
          strokeDasharray: getPartnerType(rootNode, partnerNode) === 'inferred' ? 4 : 0
          // for drawing a isDashed link
        })
      })

      return acc
    }, [])
}
