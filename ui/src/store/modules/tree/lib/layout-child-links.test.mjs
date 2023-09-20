import test from 'tape'

import layoutChildLinks from './layout-child-links.mjs'
import linkKey from './link-key.mjs'
import { PARTNER_RADIUS, PARTNER_SPACE } from '../constants.mjs'

function node (id, x, y) {
  return {
    data: { id },
    x,
    y
  }
}

test('layoutChildLinks', t => {
  /*
       Mum---Dad
           |  |
           |  ---------
       --------       |
       |      |       |
      Son  Daughter  Later

  */

  const rootNode = {
    ...node('_Dad', 0, 0), // Dad is rootNode, Mum is partnerNode

    partners: [node('_Mum', -200, 0)],
    children: [
      node('_Son', -200, -400),
      node('_Daughter', 0, -400),
      node('_Later', 200, -400)
    ]
  }

  const childLinks = {
    _Dad: {
      _Son: 'birth',
      _Daughter: 'birth',
      _Later: 'birth'
    },
    _Mum: {
      _Son: 'birth',
      _Daughter: 'birth'
    }
  }

  const partnerLinks = {
    _Dad: {
      _Mum: 'partners'
    }
  }

  const getters = {
    getChildType: (parent, child) => {
      const parentId = parent.data.id
      const childId = child.data.id
      return childLinks[parentId] && childLinks[parentId][childId]
    },
    getPartnerType: (partnerA, partnerB) => {
      const [A, B] = [partnerA.data.id, partnerB.data.id].sort()
      return partnerLinks[A] && partnerLinks[A][B]
    }
  }

  const links = layoutChildLinks(rootNode, [], getters)
  t.equal(links.length, 3, 'correct number of links')

  const findLink = (parents, child) => {
    const key = linkKey('child', parents, child)
    return links.find(link => link.key === key)
  }

  t.deepEqual(
    findLink('_Dad', '_Later').d,
    'M 0, 0 V -195 H 200 V -400',
    'Dad-Later link correct'
  )

  let dadMumMidpoint = (
    rootNode.partners[0].x + // Mum.x
    PARTNER_RADIUS + PARTNER_SPACE / 2 // we add because Mum.x < Dad.x
  )
  t.deepEqual(
    findLink(['_Dad', '_Mum'], '_Daughter').d,
    `M ${dadMumMidpoint}, 0 V -185 H 0 V -400`,
    'Dad+Mum-Daughter link correct'
  )

  // we move mum to the other side!
  rootNode.partners[0].x = 200
  dadMumMidpoint = (
    rootNode.partners[0].x - // Mum.x
    PARTNER_RADIUS - PARTNER_SPACE / 2 // we subtract because Mum.x ? Dad.x
  )

  t.end()
})
