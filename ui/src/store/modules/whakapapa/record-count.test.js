import { Getters } from './lib/test-helpers'
import { WhangaiGrandparentComplex, ExtendedFamilyA } from './fixtures'

const test = require('tape')

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

  t.equal(getters.recordCount, 5)

  state.veiw.changes.collapsed.Grandma = true
  t.equal(getters.recordCount, 5, 'collapsing nodes doesnt effect count')

  state.view.importantRelationships = {}
  t.equal(getters.recordCount, 5, 'wiping importantRelationships doesnt effect count')

  state.veiw.changes.focus = 'Daughter'
  t.equal(getters.recordCount, 5, 'temporarily changing focus doesnt effect count')

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

  t.equal(getters.recordCount, 5) // A, X, B, ax, ab

  state.veiw.changes.showExtendedFamily = true
  t.equal(getters.recordCount, 5)
  // NOTE in future if we want to persist extendedFamily state,
  // then our definition of "recordCount" may change

  t.end()
})
