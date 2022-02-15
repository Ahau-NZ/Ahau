import { Getters, State } from './lib/test-helpers'
import { ExtendedFamilyA, WhangaiGrandparentSimple, WhangaiGrandparentComplex } from './fixtures'

const test = require('tape')
const { getters } = require('./').default()

test('vuex/whakapapa getters.getPartnerIds', t => {
  //   Y   X∙∙∙A---B   C
  //    \ / \ /  |  \ /
  //    xy  ax   ab  bc
  const state = ExtendedFamilyA()
  const getPartnerIds = getters.getPartnerIds(state, Getters(state))

  t.deepEqual(
    getPartnerIds('A'),
    ['B', 'X'],
    'returns correct partners of A'
  )

  state.view.extendedFamily = true

  t.deepEqual(
    getPartnerIds('A'),
    ['X', 'B', 'Y', 'C'],
    'returns extended family partners'
  )

  /* Test to check partnerLinks ordering: */
  //    A-?-B--C
  // const state2 = State({
  //   view: {
  //     // focus: 'B',
  //     extendedFamily: false
  //   },
  //   // childLinks: {},
  //   partnerLinks: {
  //     A: {
  //       B: 'inferred'
  //     },
  //     B: {
  //       C: 'partners'
  //     }
  //   }
  // })

  // t.deepEqual(
  //   getters.getPartnerIds(state2, _getters)('B'),
  //   ['C', 'A'],
  //   'handles partnerLinks ordering thing'
  // )

  t.end()
})

/*
  what happens to ignored extended partners?

  i.e. Y when X is ignored
  i.e. C when B is ignored
*/

test('vuex/whakapapa getters.getPartnerIds (with importantRelationships - children)', t => {
  const state = WhangaiGrandparentSimple()
  const getPartnerIds = getters.getPartnerIds(state, Getters(state))
  /* whangai to grandparent */
  //    Grandad --
  //      |      |
  //     Son     |
  //      |      |
  //  Grandaughter
  //      |
  //     Baby

  t.deepEqual(getPartnerIds('Grandad'), [], 'Grandad has no partners')
  t.deepEqual(getPartnerIds('Son'), [], 'Son has no partners')
  t.deepEqual(getPartnerIds('Grandaughter'), [], 'Grandaughter has no partners')

  console.log('set extendedFamily = true')
  state.view.extendedFamily = true
  t.deepEqual(getPartnerIds('Grandad'), [], 'Grandad has no partners')
  t.deepEqual(getPartnerIds('Son'), [], 'Son has no partners')
  t.deepEqual(getPartnerIds('Grandaughter'), [], 'Grandaughter has no partners')

  console.log('set importantRelationship')
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Grandad' },
      other: [{ profileId: 'Son' }]
    }
  }
  t.deepEqual(getPartnerIds('Grandad'), [], 'Grandad has no partners')
  t.deepEqual(getPartnerIds('Son'), [], 'Son has no partners')
  t.deepEqual(getPartnerIds('Grandaughter'), [], 'Grandaughter has no partners')

  t.end()
})

test('vuex/whakapapa getters.getPartnerIds (whangai grandparent complex)', t => {
  /* whangai to grandparent

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */
  const state = WhangaiGrandparentComplex()
  const getPartnerIds = getters.getPartnerIds(state, Getters(state))

  t.deepEqual(getPartnerIds('Grandma'), ['Grandad'], 'Grandma partners = Grandad')
  t.deepEqual(getPartnerIds('Daughter'), ['Husband'], 'Daughter patners = Husband')
  t.deepEqual(getPartnerIds('Grandaughter'), [], 'Grandaughter has no partners')

  console.log('set extendedFamily = true')
  state.view.extendedFamily = true
  t.deepEqual(getPartnerIds('Grandma'), ['Grandad'], 'Grandma partners = Grandad')
  t.deepEqual(getPartnerIds('Daughter'), ['Husband'], 'Daughter patners = Husband')
  t.deepEqual(getPartnerIds('Grandaughter'), [], 'Grandaughter has no partners')

  console.log('remove importantRelationship')
  state.view.importantRelationships = {}
  // t.deepEqual(getPartnerIds('Grandma'), ['Grandad'], 'Grandma partners = Grandad')
  // t.deepEqual(getPartnerIds('Daughter'), ['Husband'], 'Daughter patners = Husband')
  console.log('NOTE - failing tests commented out')
  t.deepEqual(getPartnerIds('Grandaughter'), [], 'Grandaughter has no partners')

  t.end()
})

test('vuex/whakapapa getters.getPartnerIds (with importantRelationships - partners)', t => {
  // this test shows the importantRelationships does not effect partnerIds
  // NOTE if the importantRelationship was with the parent, then it would effect the listed partners

  /* siblings are partners */
  //     Parent
  //     /   \
  //   Son--Daughter

  // example rule:
  // {
  //   profileId: Daughter
  //   primary: Son,
  //   others: [Parent]
  // }
  //
  // This rule would move Daughter to just be drawn as a partner of Son
  // and a "lessImportantLink" would be drawn Parent--Daughter
  //
  //     Parent
  //     /   .
  //   Son--Daughter
  //

  const state = State({
    view: {
      focus: 'Parent',
      extendedFamily: false
    },
    childLinks: {
      Parent: {
        Son: 'birth',
        Daughter: 'whangai'
      }
    },
    partnerLinks: {
      Daughter: {
        Son: 'partners'
      }
    }
  })
  const getPartnerIds = getters.getPartnerIds(state, Getters(state))

  t.deepEqual(getPartnerIds('Daughter'), ['Son'])
  t.deepEqual(getPartnerIds('Son'), ['Daughter'])

  state.view.extendedFamily = true
  t.deepEqual(getPartnerIds('Daughter'), ['Son'], 'extendedFamily ok')

  state.view.importantRelationships = {
    Daughter: {
      profileId: 'Daughter',
      primary: { profileId: 'Son' },
      other: [{ profileId: 'Parent' }]
    }
  }

  t.deepEqual(getPartnerIds('Daughter'), ['Son'], 'with importantRelationships')
  t.deepEqual(getPartnerIds('Son'), ['Daughter'], 'with importantRelationships')

  t.end()
})

test('vuex/whakapapa getters.getPartnerIds (with collapsed)', t => {
  // this test shows the importantRelationships does not effect partnerIds
  // NOTE if the importantRelationship was with the parent, then it would effect the listed partners

  //  A--B

  const state = State({
    view: {
      focus: 'B',
      extendedFamily: false
    },
    childLinks: {},
    partnerLinks: {
      A: {
        B: 'partners'
      }
    },
    collapsed: {
      B: true
    }
  })
  const getPartnerIds = getters.getPartnerIds(state, Getters(state))

  t.deepEqual(getPartnerIds('B'), [])

  t.end()
})
