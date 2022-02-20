import { Getters } from './lib/test-helpers'
import { WhangaiGrandparentComplex, MarriageWithinTree } from './fixtures'

const test = require('tape')
const { getters } = require('./').default()

test('vuex/whakapapa getters.secondaryLinks', t => {
  /* whangai to grandparent

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */
  const state = WhangaiGrandparentComplex()
  const secondaryLinks = () => getters.secondaryLinks(state, Getters(state))

  t.deepEqual(
    secondaryLinks(),
    {
      childLinks: [
        { parent: 'Daughter', child: 'Grandaughter', relationshipType: 'birth' },
        { parent: 'Husband', child: 'Grandaughter', relationshipType: 'birth' }
      ],
      partnerLinks: []
    },
    'finds birth parent links'
  )

  console.log('wipe importantRelationships')
  state.view.importantRelationships = {}
  t.deepEqual(
    secondaryLinks(),
    {
      childLinks: [],
      partnerLinks: []
    },
    'no secondaryLinks'
  )

  console.log('set importantRelationship to be with Daughter')
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Daughter' }
    }
  }
  t.deepEqual(
    secondaryLinks(),
    {
      childLinks: [
        { parent: 'Grandma', child: 'Grandaughter', relationshipType: 'whangai' },
        { parent: 'Grandad', child: 'Grandaughter', relationshipType: 'whangai' }
      ],
      partnerLinks: []
    },
    'finds whangai parent links'
  )

  t.end()
})

test('vuex/whakapapa getters.secondaryLinks (marriage within tree)', t => {
  /* marriage within tree

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
               Daughter─┬───(Son)
                        │
                   Grandaughter

  */
  const state = MarriageWithinTree()
  const secondaryLinks = () => getters.secondaryLinks(state, Getters(state))

  t.deepEqual(
    secondaryLinks(),
    {
      childLinks: [
        { parent: 'Grandma', child: 'Son', relationshipType: 'whangai' },
        { parent: 'Grandad', child: 'Son', relationshipType: 'whangai' }
      ],
      partnerLinks: []
    },
    'finds whangai parent links'
  )

  console.log('remove importantRelationship')
  state.view.importantRelationships = {}
  t.deepEqual(
    secondaryLinks(),
    { childLinks: [], partnerLinks: [] }
  )

  t.end()
})
