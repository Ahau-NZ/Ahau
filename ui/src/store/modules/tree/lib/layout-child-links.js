/* eslint brace-style: ["error", "stroustrup", { "allowSingleLine": true }] */
// see https://eslint.org/docs/rules/brace-style
import linkStyle from './link-style'
import linkKey from './link-key'
import { RADIUS, PARTNER_RADIUS, PARTNER_SPACE } from '../constants'
import settings from '../../../../lib/link'

const pileSort = require('pile-sort')

export default function layoutChildLinks (rootNode, partnerLinks, { getChildType, getPartnerType }) {
  if (!rootNode.children || !rootNode.children.length) return []
  // create object with number of links for Y offset
  const partnersMultiplier = {}
  partnerLinks.forEach(function (link, i) {
    partnersMultiplier[link.key] = i
  })
  const adults = [rootNode, ...rootNode.partners]

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

  const soloLinks = []
  soloLinkChildren.forEach(childNode => {
    adults.forEach(parentNode => {
      const relType = getChildType(parentNode, childNode)
      if (!relType) return
      soloLinks.push(soloLink(rootNode, parentNode, childNode, relType))
    })
  })

  const multiLinks = {}
  multiLinkChildren.forEach(childNode => {
    adults.forEach(A => {
      adults.forEach(B => {
        if (!getPartnerType(A, B)) return
        const relType = getChildType(A, childNode)
        if (!relType) return
        if (getChildType(B, childNode) !== relType) return

        // search for the partner link
        const partnerLinkKey = linkKey('partner', [A, B])
        const partnerLink = partnerLinks.find(link => link.key === partnerLinkKey)

        // use assign link multiplier to opts for Yoffset
        const opts = (partnerLink) ? { startY: partnerLink.y } : {}
        opts.multipler = partnersMultiplier[partnerLinkKey]

        const link = multiLink(rootNode, [A, B], childNode, relType, opts)
        multiLinks[link.key] = link
      })
    })
  })

  return [
    ...soloLinks,
    ...Object.values(multiLinks)
  ]
}

const Y_BASE = 5
const Y_SPACE = 10

// tracks
//
// midpoint 0
//          5  -- soloLinks
//         15  -- multiLinks

function soloLink (rootNode, parentNode, childNode, relType) {
  const isDashed = relType !== 'birth'
  // for drawing a isDashed link to represent adopted/whangai

  return {
    key: linkKey('child', parentNode, childNode),
    parent: parentNode.data.id,
    child: childNode.data.id,
    d: settings.path( // for drawing a link from the parent to child
      {
        startX: parentNode.x,
        startY: parentNode.y,
        endX: childNode.x,
        endY: childNode.y
      },
      (parentNode.y + childNode.y) / 2 + Y_BASE
    ),
    style: linkStyle({
      // inherits the style from the parent so the links are the same color
      // TODO no longer true?
      stroke: isDashed ? '#333' : settings.color.default, // darker than default if dashed
      strokeDasharray: isDashed ? 2.5 : 0
    })
  }
}

function multiLink (rootNode, [A, B], childNode, relType, opts = {}) {
  const isDashed = relType !== 'birth'
  // for drawing a isDashed link to represent adopted/whangai
  const radius = (node) => (node === rootNode) ? RADIUS : PARTNER_RADIUS
  const startY = opts.startY || A.y

  let startX
  if (A === rootNode) {
    startX = (B.x < rootNode.x)
      ? B.x + PARTNER_RADIUS + PARTNER_SPACE / 2
      : B.x - PARTNER_RADIUS - PARTNER_SPACE / 2
  }
  else if (B === rootNode) {
    startX = (A.x < rootNode.x)
      ? A.x + PARTNER_RADIUS + PARTNER_SPACE / 2
      : A.x - PARTNER_RADIUS - PARTNER_SPACE / 2
  }
  else {
    startX = A.x < B.x
      ? (A.x + radius(A) + B.x - radius(B)) / 2
      : (B.x + radius(B) + A.x - radius(A)) / 2
  }

  return {
    key: linkKey('child', [A, B], childNode),
    parents: [A.data.id, B.data.id],
    child: childNode.data.id,
    d: settings.path( // for drawing a link from the parent to child
      {
        startX,
        startY,
        endX: childNode.x,
        endY: childNode.y
      },
      (startY + childNode.y) / 2 + Y_BASE + Y_SPACE
    ),
    style: linkStyle({
      // inherits the style from the parent so the links are the same color
      // TODO no longer true?
      stroke: isDashed ? '#333' : settings.color.default, // darker than default if dashed
      strokeDasharray: isDashed ? 2.5 : 0
    })
  }
}
