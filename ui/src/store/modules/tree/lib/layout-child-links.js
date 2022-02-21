import linkStyle from './link-style'
import linkKey from './link-key'
import { RADIUS, PARTNER_RADIUS } from '../constants'
import settings from '../../../../lib/link'

const pileSort = require('pile-sort')

export default function layoutChildLinks (rootNode, rootGetters) {
  if (!rootNode.children || !rootNode.children.length) return []

  const adults = [rootNode, ...rootNode.partners]
  const getChildType = (parentNode, childNode) => {
    return rootGetters['whakapapa/getChildRelationshipType'](parentNode.data.id, childNode.data.id)
  }
  const getPartnerType = (A, B) => {
    return rootGetters['whakapapa/getPartnerRelationshipType'](A.data.id, B.data.id)
  }

  // find all the children with only one parentLink (of each type) among the adults
  const [soloLinkChildren, multiLinkChildren] = pileSort(
    rootNode.children,
    [childNode => {
      const count = {}
      adults.forEach(parentNode => {
        const relType = getChildType(parentNode, childNode)
        if (relType) count[relType] = (count[relType] || 0) + 1
      })

      return Object.values(count).every(subcount => subcount === 1)
    }]
  )

  const links = []

  soloLinkChildren.forEach(childNode => {
    adults.forEach(parentNode => {
      const relType = getChildType(parentNode, childNode)
      if (!relType) return
      links.push(soloLink(rootNode, parentNode, childNode, relType))
    })
  })

  multiLinkChildren.forEach(childNode => {
    adults.forEach(A => {
      adults.forEach(B => {
        if (!getPartnerType(A, B)) return
        const relType = getChildType(A, childNode)
        if (!relType) return
        if (getChildType(B, childNode) !== relType) return
        links.push(multiLink(rootNode, [A, B], childNode, relType))
      })
    })
  })

  return links
}

function soloLink (rootNode, parentNode, childNode, relType) {
  return {
    key: linkKey('child', parentNode, childNode),
    d: settings.path( // for drawing a link from the parent to child
      {
        startX: parentNode.x,
        startY: parentNode.y,
        endX: childNode.x,
        endY: childNode.y
      },
      settings.branch
    ),
    style: linkStyle({
      // inherits the style from the parent so the links are the same color
      // TODO no longer true?
      strokeDasharray: (relType === 'birth')
        ? 0
        : 2.5 // for drawing a isDashed link to represent adopted/whangai
    })
  }
}

function multiLink (rootNode, [A, B], childNode, relType) {
  const radius = (node) => (node === rootNode) ? RADIUS : PARTNER_RADIUS

  const startX = A.x < B.x
    ? (A.x + radius(A) - B.x - radius(B)) / 2
    : (B.x + radius(B) - A.x - radius(A)) / 2

  return {
    key: linkKey('child', A, B, childNode),
    d: settings.path( // for drawing a link from the parent to child
      {
        startX,
        startY: A.y,
        endX: childNode.x,
        endY: childNode.y
      },
      settings.branch
    ),
    style: linkStyle({
      // inherits the style from the parent so the links are the same color
      // TODO no longer true?
      strokeDasharray: (relType === 'birth')
        ? 0
        : 2.5 // for drawing a isDashed link to represent adopted/whangai
    })
  }
}
