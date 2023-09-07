import test from 'tape'

import { Getters } from './lib/test-helpers.mjs'
import { WhangaiGrandparentComplex, MarriageWithinTree } from './fixtures/index.mjs'

test('vuex/whakapapa getters.secondaryLinks', t => {
  /* whangai to grandparent
                            ∇
                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */
  const state = WhangaiGrandparentComplex()
  const getters = Getters(state)

  t.deepEqual(
    getters.secondaryLinks,
    [
      { parent: 'Daughter', child: 'Grandaughter', relationshipType: 'birth' },
      { parent: 'Husband', child: 'Grandaughter', relationshipType: 'birth' }
    ],
    'finds birth parent links'
  )

  t.pass('wipe importantRelationships')
  state.view.importantRelationships = {}
  t.deepEqual(getters.secondaryLinks, [], 'no secondaryLinks')

  t.pass('set importantRelationship to be with Daughter')
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Daughter' }
    }
  }
  t.deepEqual(
    getters.secondaryLinks,
    [
      { parent: 'Grandma', child: 'Grandaughter', relationshipType: 'whangai' },
      { parent: 'Grandad', child: 'Grandaughter', relationshipType: 'whangai' }
    ],
    'finds whangai parent links'
  )

  t.end()
})

test('vuex/whakapapa getters.secondaryLinks (marriage within tree)', t => {
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
  const getters = Getters(state)

  t.deepEqual(
    getters.secondaryLinks,
    [
      { parent: 'Grandma', child: 'Son', relationshipType: 'whangai' },
      { parent: 'Grandad', child: 'Son', relationshipType: 'whangai' }
    ],
    'finds whangai parent links'
  )

  t.pass('remove importantRelationship')
  state.view.importantRelationships = {}
  t.deepEqual(getters.secondaryLinks, [])

  t.end()
})

test('vuex/whakapapa getters.secondaryLinks (leftover importantRelationships)', t => {
  /* marriage within tree

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
             x Daughter─┬───(Son)
                        │
                   Grandaughter

  */
  const state = MarriageWithinTree()
  const getters = Getters(state)
  // remove the Daughter node
  delete state.childLinks.Grandma.Daughter
  delete state.childLinks.Grandad.Daughter
  delete state.partnerLinks.Daughter.Son
  // NOTE there is a useless importantRelationship defined on Son now

  t.deepEqual(getters.secondaryLinks, [], 'no secondary links')

  t.end()
})
