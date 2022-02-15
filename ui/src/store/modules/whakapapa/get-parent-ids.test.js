import { State, Getters } from './lib/test-helpers'
import { WhangaiGrandparentSimple, WhangaiGrandparentComplex } from './fixtures'

const test = require('tape')
const { getters } = require('./').default()

test('vuex/whakapapa getters.getParentIds (with importantRelationships - children)', t => {
  /* whangai to grandparent */
  //    Grandad --
  //      |      |
  //     Son     |
  //      |      |
  //  Grandaughter
  //      |
  //     Baby
  const state = WhangaiGrandparentSimple()
  const getParentIds = getters.getParentIds(state, Getters(state))

  t.deepEqual(getParentIds('Grandad'), [], 'Grandad')
  t.deepEqual(getParentIds('Son'), ['Grandad'], 'Son')
  t.deepEqual(getParentIds('Grandaughter'), ['Grandad', 'Son'], 'Grandaughter')

  console.log('set importantRelationship')
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Grandad' },
      other: [{ profileId: 'Son' }]
    }
  }

  t.deepEqual(getParentIds('Grandad'), [], 'Grandad')
  t.deepEqual(getParentIds('Son'), ['Grandad'], 'Son')
  t.deepEqual(getParentIds('Grandaughter'), ['Grandad'], 'Grandaughter')

  t.end()
})

test('vuex/whakapapa getters.getParentIds (whangai grandparent complex)', t => {
  /* whangai to grandparent

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */
  // NOTE Grandma is the focus of the graph
  const state = WhangaiGrandparentComplex()
  const getParentIds = getters.getParentIds(state, Getters(state))

  t.deepEqual(getParentIds('Grandma'), [], 'Grandma')
  t.deepEqual(getParentIds('Daughter'), ['Grandma', 'Grandad'], 'Daughter')
  t.deepEqual(getParentIds('Grandaughter'), ['Grandma', 'Grandad'], 'Grandaughter')

  console.log('change importantRelationship to be we partner')
  state.view.importantRelationships.Grandaughter.primary.profileId = 'Grandad'
  t.deepEqual(getParentIds('Grandaughter'), ['Grandma', 'Grandad'], 'Grandaughter')
  // This is the hard case where primary parent link is Grandad

  console.log('remove importantRelationship')
  state.view.importantRelationships = {}
  t.deepEqual(getParentIds('Grandma'), [], 'Grandma')
  t.deepEqual(getParentIds('Daughter'), ['Grandma', 'Grandad'], 'Daughter')
  t.deepEqual(getParentIds('Grandaughter'), ['Grandma', 'Daughter', 'Grandad', 'Husband'], 'Grandaughter')

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

  t.deepEqual(getters.getPartnerIds(state, Getters(state))('Daughter'), ['Son'])
  t.deepEqual(getters.getPartnerIds(state, Getters(state))('Son'), ['Daughter'])

  state.view.extendedFamily = true
  t.deepEqual(getters.getPartnerIds(state, Getters(state))('Daughter'), ['Son'], 'extendedFamily ok')

  state.view.importantRelationships = [{
    profileId: 'Daughter',
    primary: { profileId: 'Son' },
    other: [{ profileId: 'Parent' }]
  }]

  t.deepEqual(getters.getPartnerIds(state, Getters(state))('Daughter'), ['Son'], 'with importantRelationships')
  t.deepEqual(getters.getPartnerIds(state, Getters(state))('Son'), ['Daughter'], 'with importantRelationships')

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
  const getParentIds = getters.getParentIds(state, Getters(state))

  t.deepEqual(getParentIds('B'), [])

  t.end()
})

test('vuex/whakapapa getters.parentIds (mixed childLinks)', t => {
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
  const getParentIds = getters.getParentIds(state, Getters(state))

  t.deepEqual(getParentIds('ay'), ['Y'])

  console.log('extendedFamily')
  state.view.extendedFamily = true
  t.deepEqual(getParentIds('ay'), ['Y', 'X'])

  t.end()
})
