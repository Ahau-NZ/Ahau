import { RADIUS, PARTNER_RADIUS, PARTNER_SPACE } from '../constants'

export default function layoutPartnerNodes (rootNode, rootGetters) {
  const partnerIds = rootGetters['whakapapa/getPartnerIds'](rootNode.data.id)

  if (!partnerIds.length) return []

  const childNodes = rootNode.children || []

  function meanChildX (partnerId) {
    // get the children of partner
    const partnerChildren = rootGetters['whakapapa/getChildIds'](partnerId)
      // keep only the birth children
      .filter(childId => rootGetters['whakapapa/getChildType'](partnerId, childId) === 'birth')
      // get the nodes from the graph that are also a child of the rootNode
      .map(partnerChildId => childNodes.find(node => node.data.id === partnerChildId))
      // filters out empty entries
      .filter(Boolean)

    if (!partnerChildren.length) return 1000
    // if no children push them way to the right.
    // We did this to priortise the position of partners with children over the order in which the partner were created
    // the core problem is that we dont record the order or dates of relationships currently.
    // This needs some design if we want to add this feature

    // this return the average x position of the partners children
    return meanX(partnerChildren)
  }

  const hopDistance = RADIUS + PARTNER_SPACE + PARTNER_RADIUS

  return partnerIds.reverse()// TODO: do this reverse upstream
    // calcuate where most of their children are
    .map(partnerId => {
      return {
        id: partnerId,
        meanChildX: meanChildX(partnerId) - rootNode.x // shift x average to be relative to the rootNode
      }
    })
    // put the partners in order of child position
    .sort((A, B) => {
      return (A.meanChildX - B.meanChildX)
    })
    .map((A, i, arr) => {
      // if meanChildX is negative push to left, if positive to right
      if (A.meanChildX < 0) {
        // get an arr of elements that are on the left of the rootNode
        const lessThanZero = arr.filter(A => A.meanChildX < 0).map(A => A.id)
        // figure out which one this is
        const index = lessThanZero.indexOf(A.id)
        // figure how many hops it is from the rootNode
        const hops = lessThanZero.length - index
        return {
          // set how many hops based on their position in that set
          x: rootNode.x - hops * hopDistance,
          y: rootNode.y,
          data: { id: A.id }
        }
      } else {
        // get an arr of elements that are on the right of the rootNode
        const moreThanZero = arr.filter(A => A.meanChildX >= 0).map(A => A.id)
        // figure out which one this is
        const index = moreThanZero.indexOf(A.id)
        // figure how many hops it is from the rootNode
        return {
          // set how many hops based on their position in that set
          x: rootNode.x + (index + 1) * hopDistance,
          y: rootNode.y,
          data: { id: A.id }
        }
      }
    })
}

function meanX (nodes) {
  return (
    nodes.reduce((acc, node) => acc + node.x, 0) /
    nodes.length
  )
}
