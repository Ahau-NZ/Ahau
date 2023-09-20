import { RADIUS, PARTNER_RADIUS, PARTNER_SPACE } from '../constants.mjs'

export default function layoutPartnerNodes (rootNode, rootGetters) {
  const childNodes = rootNode.children || []
  const partnerIds = rootGetters['whakapapa/getPartnerIds'](rootNode.data.id)

  if (!partnerIds.length) return []

  function meanChildX (partnerId, partnerX) {
    // get the children of partner
    const partnerChildren = rootGetters['whakapapa/getChildIds'](partnerId)
      // keep only the birth children
      .filter(childId => rootGetters['whakapapa/getChildType'](partnerId, childId) === 'birth')
      // get the nodes from the graph that are also a child of the rootNode
      .map(partnerChildId => childNodes.find(node => node.data.id === partnerChildId))
      // filters out empty entries
      .filter(Boolean)

    if (!partnerChildren.length) return null
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
      let meanX = meanChildX(partnerId)
      if (meanX === null) {
        // when we couldn't calculate a meanChildX, make up a meanX
        // on the right or left of the rootNode
        // (based on how many partners total at the moment)
        meanX = rootNode.x + ((partnerIds.length <= 1) ? -1 : 10000)
        // if only one partner, put on left
        // if more then one partner, throw them waaaay right
      }

      return {
        id: partnerId,
        relativeChildX: meanX - rootNode.x// shift x average to be relative to the rootNode
      }
    })
    // put the partners in order of child position
    .sort((A, B) => {
      return (A.relativeChildX - B.relativeChildX)
    })
    .map((A, i, arr) => {
      // get the medium number of partners
      const middle = Math.ceil(arr.length / 2)
      // split arr down the middle
      if (i < middle) {
        const firstHalf = arr.slice(0, middle).map(A => A.id)
        // figure out which one this is
        const index = firstHalf.indexOf(A.id)
        // figure how many hops it is from the rootNode
        const hops = firstHalf.length - index
        return {
          // set how many hops based on their position in that set
          x: rootNode.x - hops * hopDistance,
          y: rootNode.y,
          data: { id: A.id }
        }
      } else {
        const secondHalf = arr.slice(middle).map(A => A.id)
        // // get an arr of elements that are on the right of the rootNode
        const index = secondHalf.indexOf(A.id)

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
