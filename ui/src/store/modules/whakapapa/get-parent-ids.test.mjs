import test from 'tape'

import { State, Getters } from './lib/test-helpers.mjs'
import { WhangaiGrandparentSimple, WhangaiGrandparentComplex, MarriageWithinTree } from './fixtures/index.mjs'

test('vuex/whakapapa getters.getParentIds (with importantRelationships - children)', t => {
  /* whangai to grandparent

          ∇
       Grandad ╌╌┐
          |      ┆
         Son     ┆
          |      ┆
      Grandaughter
          |
         Baby

  */
  const state = WhangaiGrandparentSimple()
  const { getParentIds } = Getters(state)

  t.deepEqual(getParentIds('Grandad'), [], 'Grandad')
  t.deepEqual(getParentIds('Son'), ['Grandad'], 'Son')
  t.deepEqual(getParentIds('Grandaughter'), ['Grandad', 'Son'], 'Grandaughter')

  t.pass('set importantRelationship')
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

                            ∇
                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */
  // NOTE Grandma is the focus of the graph
  const state = WhangaiGrandparentComplex()
  const { getParentIds } = Getters(state)

  t.deepEqual(getParentIds('Grandma'), [], 'Grandma')
  t.deepEqual(getParentIds('Daughter'), ['Grandma', 'Grandad'], 'Daughter')
  t.deepEqual(getParentIds('Grandaughter'), ['Grandma', 'Grandad'], 'Grandaughter')

  t.pass('change importantRelationship to be we partner')
  state.view.importantRelationships.Grandaughter.primary.profileId = 'Grandad'
  t.deepEqual(getParentIds('Grandaughter'), ['Grandma', 'Grandad'], 'Grandaughter')
  // This is the hard case where primary parent link is Grandad

  t.pass('remove importantRelationship')
  state.view.importantRelationships = {}
  t.deepEqual(getParentIds('Grandma'), [], 'Grandma')
  t.deepEqual(getParentIds('Daughter'), ['Grandma', 'Grandad'], 'Daughter')
  t.deepEqual(getParentIds('Grandaughter'), ['Grandma', 'Daughter', 'Grandad', 'Husband'], 'Grandaughter')

  t.end()
})

test('vuex/whakapapa getters.getParentIds (with importantRelationships - partners)', t => {
  // this test shows the importantRelationships does not effect parentIds
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
      focus: 'Parent'
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
  const { getParentIds } = Getters(state)

  t.deepEqual(getParentIds('Daughter'), ['Parent'])
  t.deepEqual(getParentIds('Son'), ['Parent'])

  state.view.changes.showExtendedFamily = true
  t.deepEqual(getParentIds('Daughter'), ['Parent'], 'extendedFamily ok')

  state.view.importantRelationships = [{
    profileId: 'Daughter',
    primary: { profileId: 'Son' },
    other: [{ profileId: 'Parent' }]
  }]

  t.deepEqual(getParentIds('Daughter'), ['Parent'], 'with importantRelationships')
  t.deepEqual(getParentIds('Son'), ['Parent'], 'with importantRelationships')

  t.end()
})

test('vuex/whakapapa getters.getParentIds (with collapsed)', t => {
  // this test shows the importantRelationships does not effect partnerIds
  // NOTE if the importantRelationship was with the parent, then it would effect the listed partners

  //  A--B

  const state = State({
    view: {
      focus: 'B'
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
  const { getParentIds } = Getters(state)

  t.deepEqual(getParentIds('B'), [])

  t.end()
})

test('vuex/whakapapa getters.getParentIds (mixed childLinks)', t => {
  //  X   Y
  //   ? /
  //   ay

  const state = State({
    view: {
      focus: 'Y'
    },
    childLinks: {
      Y: { ay: 'birth' },
      X: { ay: 'adopted' }
    }
  })
  const { getParentIds } = Getters(state)

  t.deepEqual(getParentIds('ay'), ['Y'])

  t.pass('extendedFamily')
  state.view.changes.showExtendedFamily = true
  t.deepEqual(getParentIds('ay'), ['Y', 'X'])

  t.end()
})

test('vuex/whakapapa getters.getParentIds (marriage within tree)', t => {
  /* marriage within tree

                            ∇
                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
               Daughter─┬───(Son)
                        │
                   Grandaughter

  */
  const state = MarriageWithinTree()
  const { getParentIds } = Getters(state)

  t.deepEqual(getParentIds('Grandaughter'), ['Daughter', 'Son'])
  // t.deepEqual(getParentIds('Son'), ['Grandad', 'Grandma'])
  t.deepEqual(getParentIds('Son'), [])

  t.pass('remove importantRelationship')
  state.view.importantRelationships = {}
  t.deepEqual(getParentIds('Grandaughter'), ['Daughter', 'Son'])
  t.deepEqual(getParentIds('Son'), ['Grandma', 'Grandad'])

  t.end()
})
