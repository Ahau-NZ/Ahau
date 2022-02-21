import * as d3 from 'd3'
import groupBy from 'lodash.groupby'
// import isEmpty from 'lodash.isempty'

import {
  layoutPartnerNodes,
  layoutPartnerLinks,
  layoutChildLinks
} from './lib'

import settings from '../../../lib/link'

// const X_PADDING = 10 // ....
const NODE_SIZE_X = 150
const NODE_SIZE_Y = 200

export default function () {
  const state = {
    mouseEvent: null
  }

  // we need to know the x/y of each drawn profile (d3 nodes + partners),
  // so I think we should calculate all positions here
  // this means we can more easily draw lessImortantRelationship links

  const getters = {
    mouseEvent: state => state.mouseEvent,

    countPartners: (state, getters, rootState, rootGetters) => (node) => {
      return rootGetters['whakapapa/getPartnerIds'](node.data.id).length
    },
    distanceBetweenNodes: (state, getters) => (nodeA, nodeB, areCousins) => {
      const { countPartners } = getters

      let combinedPartners = countPartners(nodeA) + countPartners(nodeB)

      if (areCousins) {
        combinedPartners += 0.5 * (
          countPartners(nodeA.parent) +
          countPartners(nodeB.parent)
        )
      }

      return 1 + (0.5 * combinedPartners)
    },

    layout (state, getters) {
      return d3.tree()
        .nodeSize([NODE_SIZE_X, NODE_SIZE_Y])
        .separation((a, b) => {
          return (a.parent === b.parent)
            ? getters.distanceBetweenNodes(b, a) // siblings (left=B, right=A)
            : getters.distanceBetweenNodes(a, b, true) // areCousins (left=A, right=B)
        })
    },

    root (state, getters, rootState, rootGetters) {
      const nestedWhakapapa = rootGetters['whakapapa/nestedWhakapapa']
      return d3.hierarchy(nestedWhakapapa)
        .sort((a, b) => (
          getBirthOrder(rootGetters['person/person'](a.id)) -
          getBirthOrder(rootGetters['person/person'](b.id))
        ))
        // TODO smoke test this
        // sort the children by birthOrder! - see https://github.com/d3/d3-hierarchy#node_sort
    },

    tree (state, getters, rootState, rootGetters) {
      const treeLayout = getters.layout(getters.root)

      // WIP HERE !!!
      // for each node in the tree:
      treeLayout.each(node => {
        // add partners (sorted by children)
        node.partners = layoutPartnerNodes(node, rootGetters)

        // then add link data
        //    - rootNode --> partner (if there's a relationship)
        //    - rootNode --> child (when solo parent)
        //    - partner --> child (when solo parent)
        //    - rootNode + partner --> child

        node.links = [
          ...layoutChildLinks(node, rootGetters),
          ...layoutPartnerLinks(node, rootGetters)
        ]
      })
      // WIP HERE

      // for each secondaryLink add links (done after above round as partners are added there)
      return treeLayout
    },
    descendants (state, getters) {
      return getters.tree.descendants()
      // returns the array of descendants starting with the root node, then followed by each child in topological order
      // TODO maybe drop descendants for specific tools like tree.find, tree.map
    },

    // nodes
    getNode: (state, getters) => (id) => {
      return getters.descendants.find(node => node && node.data.id === id)
    },
    getParentNodeId: (state, getters) => (id) => {
      const node = getters.getNode(id)

      if (!node || !node.parent || !node.parent.data) return null
      return node.parent.data.id
    },

    // DEPRECATED
    // getPartnerNodes: (state, getters, rootState, rootGetters) => (id) => {
    //   throw new Error('NO')
    //   if (this.isCollapsed) return []

    //   const partnerIds = this.getPartnerIds(this.profileId)
    //   if (!partnerIds.length) return []

    //   return mapPartnerNodes(partnerIds)
    // },

    // DEPRECATED
    // Needed to draw links between parents and children where the root node is the only parent of that child node
    // getGhostPartnerNode: (state, getters, rootState, rootGetters) => (id) => {
    //   throw new Error('NO')
    //   // find the children of this node that only parents who are solo
    //   // (could have multiple parents but not in relationship with node)
    //   const rootNode = getters.getNode(id)

    //   const children = rootNode.children.filter(childNode => {
    //     const parentIds = rootGetters['whakapapa/getParentIds'](childNode.data.id)
    //     if (parentIds.length === 1) return parentIds[0] === id

    //     return parentIds
    //       .filter(parentId => parentId !== id)
    //       .every(parentId => rootGetters['whakapapa/getPartnerRelationshipType'](parentId, id) === undefined)
    //   })
    //   if (children.length === 0) return [] // don't render if not needed

    //   const partnerIds = rootGetters['whakapapa/getPartnerIds'](id)
    //   const yOffset = rootNode.y + (partnerIds.length * settings.partner.spacing.y)

    //   return [{
    //     data: {
    //       id: 'GHOST'
    //     },
    //     ghost: true,
    //     children: children.map(({ data }) => mapChild({ y: yOffset }, data.id, DEFAULT_STYLE, id, true))
    //   }]
    // },

    // linkNodes
    secondaryLinks (state, getters, rootState, rootGetters) {
      return []

      // TEMP
      const linksByChild = groupBy(rootGetters['whakapapa/secondaryLinks'], 'child')

      return Object.entries(linksByChild).reduce(
        (acc, [childId, childLinks]) => {
          const childNode = getters.getNode(childId)
          // TODO may need to check partners
          if (!childNode) {
            console.log('cannot find childNode', childId)
            return acc
          }
          // const seenParents = new Set()

          // TODO come back to find midpoints of parents who are partners
          childLinks.forEach(childLink => {
            const parentNode = getters.getNode(childLink.parent) // TODO may need to check partners
            if (!parentNode) {
              console.log('cannot find parentNode', childLink.parent)
              return
            }

            acc.push(buildLink(parentNode, childNode, childLink.relationshipType))
          })

          return acc
        },
        []
      )

      // find the childNode in the graph (could be a partner)
      // find the "parentNode" in the graph (could be the midpoint between partners, check the links!)
    }
  }

  const mutations = {
    setMouseEvent (state, e) {
      state.mouseEvent = e
    }
  }

  const actions = {
    setMouseEvent ({ commit }, e) {
      commit('setMouseEvent', e)
    }
  }

  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
  }
}

const LINK_OFFSET = 10
function buildLink (fromNode, toNode, relationshipType) {
  const isDashed = relationshipType && relationshipType !== 'birth' && relationshipType !== 'partner'

  const coords = {
    startX: fromNode.x + (fromNode.radius || 50),
    startY: fromNode.y + (fromNode.radius || 50),
    endX: toNode.x + (toNode.radius || 50),
    endY: toNode.y + (toNode.radius || 50)
  }
  // NOTE we wouldn't need radius if all avatars were drawn centered

  if (relationshipType === 'partner') {
    coords.directed = false
  }

  const offsetX = (coords.startX < coords.endX) ? LINK_OFFSET : -1 * LINK_OFFSET
  if (fromNode.children && fromNode.children.length) coords.startX += offsetX
  coords.endX -= offsetX

  return {
    id: ['secondary', fromNode.data.id, toNode.data.id].join('-'),
    style: {
      fill: 'none',
      // stroke: settings.color.getColor(0),
      stroke: '#f0f',
      opacity: settings.opacity,
      strokeWidth: settings.thickness,
      strokeLinejoin: 'round',
      strokeDasharray: isDashed ? 2.5 : 0
    },
    d: settings.path(coords)
  }
}

// function mapChild ({ x = this.root.x, y = this.root.y, center, sign, yOffset, xOffset }, childId, style, parentId, isGhost = false) {
// function mapChild (rootNode, childNode, parentId) {
//   const isNonChild = this.getChildRelationshipType(focusNode.data.id, focusNode.data.id) === undefined
//   if (isNonChild) center = false
//   // TODO 2022-02-15 mix - I think I've replaced this correctly, but not sure

//   const relationshipType = this.getChildRelationshipType(parentId, childNode.data.id)
//   // dash link if they are not related by adopted/whangai
//   const isDashed = ['adopted', 'whangai'].includes(relationshipType)

//   // center the link between the parents
//   if (center) {
//     x = x - RADIUS + PARTNER_RADIUS - sign * (PARTNER_RADIUS + 10) // end constant is dependant on radius, PARTNER_RADIUS, X_PADDING
//     y = yOffset - RADIUS
//   }

//   // offcenter links to avoid overlapping with partner or main parent node links
//   const offCenter = !isGhost && !center

//   return {
//     ...childNode,
//     link: {
//       style: {
//         ...style, // inherits the style from the parent so the links are the same color
//         strokeDasharray: isDashed ? 2.5 : 0 // for drawing a isDashed link to represent adopted/whangai
//       },
//       d: settings.path( // for drawing a link from the parent to child
//         {
//           startX: offCenter ? x + PARTNER_RADIUS : x + RADIUS,
//           startY: offCenter ? yOffset + 10 : y + RADIUS,
//           endX: offCenter ? childNode.x + this.radius + xOffset : childNode.x + this.radius,
//           endY: childNode.y + this.radius
//         },
//         settings.branch
//       )
//     }
//   }
// }

function getBirthOrder (profile) {
  if (!profile || profile.birthOrder == null) return undefined // sorts to end
  return profile.birthOrder
}
