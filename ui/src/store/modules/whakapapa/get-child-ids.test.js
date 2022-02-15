import { State, Getters } from './lib/test-helpers'
import { WhangaiGrandparentSimple, WhangaiGrandparentComplex } from './fixtures'

const test = require('tape')
const { getters } = require('./').default()

test('vuex/whakapapa getters.getChildIds (with importantRelationships - children', t => {
  const state = WhangaiGrandparentSimple()
  const getChildIds = getters.getChildIds(state, Getters(state))
  /* whangai to grandparent */
  //    Grandad --
  //      |      |
  //     Son     |
  //      |      |
  //  Grandaughter
  //      |
  //     Baby

  t.deepEqual(getChildIds('Grandad'), ['Son', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Son'), ['Grandaughter'], 'Son')
  t.deepEqual(getChildIds('Grandaughter'), ['Baby'], 'Grandaughter')

  console.log('set importantRelationship')
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Grandad' },
      other: [{ profileId: 'Son' }]
    }
  }

  t.deepEqual(getChildIds('Grandad'), ['Son', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Son'), [], 'Son')
  t.deepEqual(getChildIds('Grandaughter'), ['Baby'], 'Grandaughter')

  t.end()
})

test('vuex/whakapapa getters.getChildIds (whangai grandparent complex)', t => {
  const state = WhangaiGrandparentComplex()
  const getChildIds = getters.getChildIds(state, Getters(state))
  /* whangai to grandparent

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */
  // NOTE Grandma is the focus of the graph

  t.deepEqual(getChildIds('Grandma'), ['Daughter', 'Grandaughter'], 'Grandma')
  t.deepEqual(getChildIds('Grandad'), ['Daughter', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Daughter'), [], 'Daughter')
  t.deepEqual(getChildIds('Husband'), [], 'Husband')

  console.log('move importantRelationship to Grandad')
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Grandad' }
    }
  }
  t.deepEqual(getChildIds('Grandma'), ['Daughter', 'Grandaughter'], 'Grandma')
  t.deepEqual(getChildIds('Grandad'), ['Daughter', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Daughter'), [], 'Daughter')
  t.deepEqual(getChildIds('Husband'), [], 'Husband')

  console.log('remove importantRelationship')
  state.view.importantRelationships = {}
  t.deepEqual(getChildIds('Grandma'), ['Daughter', 'Grandaughter'], 'Grandma')
  t.deepEqual(getChildIds('Grandad'), ['Daughter', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Daughter'), ['Grandaughter'], 'Daughter')
  t.deepEqual(getChildIds('Husband'), ['Grandaughter'], 'Husband')

  t.end()
})

test('vuex/whakapapa getters.getChildIds (with collapsed)', t => {
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

  t.deepEqual(getters.getPartnerIds(state, Getters(state))('B'), [])

  t.end()
})

test('vuex/whakapapa getters.childIds (mixed childLinks)', t => {
  //  X   Y
  //   ? /
  //   ay

  const state = State({
    view: {
      focus: 'Y',
      extendedFamily: false
    },
    childLinks: {
      Y: { ay: 'birth' },
      X: { ay: 'adopted' }
    }
  })
  const getChildIds = getters.getChildIds(state, Getters(state))

  t.deepEqual(getChildIds('Y'), ['ay'])
  t.deepEqual(getChildIds('X'), ['ay'])

  console.log('extendedFamily')
  state.view.extendedFamily = true
  t.deepEqual(getChildIds('Y'), ['ay'])
  t.deepEqual(getChildIds('X'), ['ay'])

  t.end()
})
