import test from 'tape'

import { State, Getters } from './lib/test-helpers.mjs'
import { WhangaiGrandparentSimple, WhangaiGrandparentComplex, MarriageWithinTree } from './fixtures/index.mjs'

test('vuex/whakapapa getters.getChildIds (with importantRelationships - children)', t => {
  const state = WhangaiGrandparentSimple()
  const { getChildIds } = Getters(state)
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

  t.deepEqual(getChildIds('Grandad'), ['Son', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Son'), ['Grandaughter'], 'Son')
  t.deepEqual(getChildIds('Grandaughter'), ['Baby'], 'Grandaughter')

  t.pass('set importantRelationship')
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

  state.view.changes.collapsed = { Son: true }
  t.deepEqual(getChildIds('Grandad'), ['Son', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Son'), [], 'Son')
  t.deepEqual(getChildIds('Grandaughter'), ['Baby'], 'Grandaughter')

  t.end()
})

test('vuex/whakapapa getters.getChildIds (whangai grandparent complex)', t => {
  const state = WhangaiGrandparentComplex()
  const { getChildIds } = Getters(state)
  /* whangai to grandparent

                            ∇
                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */

  t.deepEqual(getChildIds('Grandma'), ['Daughter', 'Grandaughter'], 'Grandma')
  t.deepEqual(getChildIds('Grandad'), ['Daughter', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Daughter'), [], 'Daughter')
  t.deepEqual(getChildIds('Husband'), [], 'Husband')

  t.pass('move importantRelationship to Grandad')
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

  t.pass('remove importantRelationship')
  state.view.importantRelationships = {}
  t.deepEqual(getChildIds('Grandma'), ['Daughter', 'Grandaughter'], 'Grandma')
  t.deepEqual(getChildIds('Grandad'), ['Daughter', 'Grandaughter'], 'Grandad')
  t.deepEqual(getChildIds('Daughter'), ['Grandaughter'], 'Daughter')
  t.deepEqual(getChildIds('Husband'), ['Grandaughter'], 'Husband')

  t.end()
})

test('vuex/whakapapa getters.getChildIds (with collapsed)', t => {
  //  A
  //  |
  //  B

  const state = State({
    view: {
      focus: 'A',
      changes: {
        collapsed: {
          A: true
        }
      }
    },
    childLinks: {
      A: {
        B: 'birth'
      }
    }
  })
  const { getChildIds } = Getters(state)

  t.deepEqual(getChildIds('A'), [])
  t.deepEqual(getChildIds('A', { showCollapsed: true }), ['B'])

  t.end()
})

test('vuex/whakapapa getters.getChildIds (mixed childLinks)', t => {
  //  X   Y
  //   ? /
  //   ay

  const state = State({
    view: {
      focus: 'Y',
      changes: {
        extendedFamily: false
      }
    },
    childLinks: {
      Y: { ay: 'birth' },
      X: { ay: 'adopted' }
    }
  })
  const { getChildIds } = Getters(state)

  t.deepEqual(getChildIds('Y'), ['ay'])
  t.deepEqual(getChildIds('X'), ['ay'])

  t.pass('extendedFamily')
  state.view.changes.showExtendedFamily = true
  t.deepEqual(getChildIds('Y'), ['ay'])
  t.deepEqual(getChildIds('X'), ['ay'])

  t.end()
})

test('vuex/whakapapa getters.getChildIds (marriage within tree)', t => {
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
  const { getChildIds } = Getters(state)

  t.deepEqual(getChildIds('Grandma'), ['Daughter'])
  t.deepEqual(getChildIds('Grandad'), ['Daughter'])
  t.deepEqual(getChildIds('Daughter'), ['Grandaughter'])
  t.deepEqual(getChildIds('Son'), ['Grandaughter'])

  t.pass('remove importantRelationship')
  state.view.importantRelationships = {}
  t.deepEqual(getChildIds('Grandma'), ['Daughter', 'Son'])
  t.deepEqual(getChildIds('Grandad'), ['Daughter', 'Son'])
  t.deepEqual(getChildIds('Daughter'), ['Grandaughter'])
  t.deepEqual(getChildIds('Son'), ['Grandaughter'])

  t.end()
})
