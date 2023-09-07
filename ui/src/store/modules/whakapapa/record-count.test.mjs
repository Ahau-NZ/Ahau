import test from 'tape'

import { Getters } from './lib/test-helpers.mjs'
import { WhangaiGrandparentComplex, ExtendedFamilyA } from './fixtures/index.mjs'
import src from './index.mjs'

const { actions } = src()

test('vuex/whakapapa getters.recordCount (whangai grandparent complex)', t => {
  const state = WhangaiGrandparentComplex()
  const getters = Getters(state)

  /* whangai to grandparent

                            ∇
                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */
  const getRecordCount = actions.getRecordCount({ state: state, getters: getters })

  t.equal(getRecordCount, 5)

  state.view.changes.collapsed.Grandma = true
  t.equal(getRecordCount, 5, 'collapsing nodes doesnt effect count')

  state.view.importantRelationships = {}
  t.equal(getRecordCount, 5, 'wiping importantRelationships doesnt effect count')

  state.view.changes.focus = 'Daughter'
  t.equal(getRecordCount, 5, 'temporarily changing focus doesnt effect count')

  t.end()
})

test('vuex/whakapapa getters.recordCount (extended family)', t => {
  const state = ExtendedFamilyA()
  const getters = Getters(state)

  /* extended family A
             ∇
     Y   X∙∙∙A---B   C
      \ / \ /  |  \ /
      xy  ax   ab  bc

  */
  const getRecordCount = actions.getRecordCount({ state: state, getters: getters })

  t.equal(getRecordCount, 5) // A, X, B, ax, ab

  state.view.changes.showExtendedFamily = true
  t.equal(getRecordCount, 5)
  // NOTE in future if we want to persist extendedFamily state,
  // then our definition of "recordCount" may change

  t.end()
})
