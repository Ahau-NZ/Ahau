import test from 'tape'

import { Getters } from './lib/test-helpers.mjs'
import { WhangaiGrandparentComplex, MarriageWithinTree } from './fixtures/index.mjs'
import src from './index.mjs'

const { getters } = src()

test('vuex/whakapapa getters.isDuplicate (whangai to grandparent)', t => {
  /* whangai to grandparent

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */
  const state = WhangaiGrandparentComplex()
  const isDuplicate = getters.isDuplicate(state, Getters(state))

  t.equal(isDuplicate('Grandad'), false)
  t.equal(isDuplicate('Grandma'), false)
  t.equal(isDuplicate('Daughter'), false)
  t.equal(isDuplicate('Husband'), false)
  t.equal(isDuplicate('Grandaughter'), true, 'duplicate found (is son of two people)')

  t.end()
})

test('vuex/whakapapa getters.isDuplicate (marriage within tree)', t => {
  /* marriage within tree

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
               Daughter─┬───(Son)
                        │
                   Grandaughter

  */
  const state = MarriageWithinTree()
  const isDuplicate = getters.isDuplicate(state, Getters(state))

  t.equal(isDuplicate('Grandad'), false)
  t.equal(isDuplicate('Grandma'), false)
  t.equal(isDuplicate('Daughter'), true, 'duplicate found (is a wife + daugter)')
  t.equal(isDuplicate('Son'), true, 'duplicate found (is a husband and son)')
  t.equal(isDuplicate('Grandaughter'), true, 'duplicate found (is a child of two duplicate nodes)')

  t.end()
})
