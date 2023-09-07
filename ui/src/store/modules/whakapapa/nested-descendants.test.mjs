import test from 'tape'

import { State, Getters } from './lib/test-helpers.mjs'
import { ExtendedFamilyA, WhangaiGrandparentSimple, WhangaiGrandparentComplex, MarriageWithinTree } from './fixtures/index.mjs'

test('vuex/whakapapa getters.nestedDescendants (with extendedFamily)', t => {
  //   Y   X∙∙∙A---B   C
  //    \ / \ /  |  \ /
  //    xy  ax   ab  bc
  const state = ExtendedFamilyA()
  const getters = Getters(state)

  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'A',
      children: [
        { id: 'ax', children: [] },
        { id: 'ab', children: [] }
      ]
    },
    'returns nestedDescendants'
  )

  state.view.changes.showExtendedFamily = true

  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'A',
      children: [
        { id: 'ax', children: [] },
        { id: 'ab', children: [] },
        { id: 'xy', children: [] },
        { id: 'bc', children: [] }
      ]
    },
    'returns nestedDescendants with extended family'
  )

  t.equal(
    getters.getPartnerType('A', 'C'),
    undefined,
    'returns no relationshipType for extended family partner'
  )

  t.end()
})

test('vuex/whakapapa getters.nestedDescendants (with ignoredProfiles)', t => {
  //   Y   X∙∙∙A---B   C
  //    \ / \ /  |  \ /
  //    xy  ax   ab  bc
  const state = ExtendedFamilyA()
  const getters = Getters(state)
  state.view.ignoredProfiles = ['ax']

  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'A',
      children: [
        // { id: 'ax', children: [] },
        { id: 'ab', children: [] }
      ]
    },
    'returns nestedDescendants, excluding ignoredProfiles (and profiles beyond)'
  )

  // when we have a parent ignored, extended family stop with them.
  state.view.ignoredProfiles = ['X']
  state.view.changes.showExtendedFamily = true

  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'A',
      children: [
        { id: 'ax', children: [] },
        { id: 'ab', children: [] },
        { id: 'bc', children: [] }
        // { id: 'xy', children: [] },
      ]
    },
    'returns nestedDescendants (extended), excluding ignoredProfiles (and profiles beyond)'
  )

  t.end()
})

test('vuex/whakapapa getters.nestedDescendants (with importantRelationships - child)', t => {
  /* whangai to grandparent */
  //    Grandad --
  //      |      |
  //     Son     |
  //      |      |
  //  Grandaughter
  //      |
  //     Baby
  //
  const state = WhangaiGrandparentSimple()
  const getters = Getters(state)

  // test when there's no importantRelationships to stop infinite
  // expect: grandaugter drawn in two places but stop infinite recursions

  const expected = {
    id: 'Grandad',
    children: [
      {
        id: 'Son',
        children: [
          {
            id: 'Grandaughter',
            children: [{ id: 'Baby', children: [] }]
          }
        ]
      },
      { // duplicate
        id: 'Grandaughter',
        children: [{ id: 'Baby', children: [] }]
      }
    ]
  }
  t.deepEqual(
    getters.nestedDescendants,
    expected,
    'with no importantRelationships, people are rendered twice'
  )

  /* extendedFamily = true */
  // tests for watching for consistent behaviour, infinite loops!
  state.view.changes.showExtendedFamily = true
  t.deepEqual(
    getters.nestedDescendants,
    expected,
    'with no importantRelationships, people are rendered twice (extendedFamily)'
  )

  /* adding importantRelationships */
  // here we say the grandfather is the most important link
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Grandad' }
    }
  }

  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'Grandad',
      children: [
        {
          id: 'Son',
          children: []
        },
        {
          id: 'Grandaughter',
          children: [{ id: 'Baby', children: [] }]
        }
      ]
    },
    'importantRelationship means no duplicate children'
  )
  // change it around so Son is most important
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Son' }
    }
  }

  // change it around so Son is most important
  state.view.importantRelationships = {
    Grandaughter: {
      profileId: 'Grandaughter',
      primary: { profileId: 'Son' }
    }
  }

  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'Grandad',
      children: [
        {
          id: 'Son',
          children: [
            {
              id: 'Grandaughter',
              children: [{ id: 'Baby', children: [] }]
            }
          ]
        }
      ]
    },
    'importantRelationship means no duplicate children (alt)'
  )

  t.end()
})

test('vuex/whakapapa getters.nestedDescendants (whangai grandparent complex)', t => {
  const state = WhangaiGrandparentComplex()
  const getters = Getters(state)
  /* whangai to grandparent

                Grandad─┬─Grandma
                   ┌────┴╌╌╌╌╌┐
                   │          ┆
     Husband─┬─Daughter    (whangai)
             │                ┆
        Grandaughter╌╌╌╌╌╌╌╌╌╌┘

  */

  const expected = {
    id: 'Grandma',
    children: [
      {
        id: 'Daughter',
        children: []
      },
      {
        id: 'Grandaughter',
        children: []
      }
    ]
  }

  t.deepEqual(
    getters.nestedDescendants,
    expected,
    'importantRelationship means no duplicate children'
  )

  // change the importantRelationship link
  state.view.importantRelationships.Grandaughter.primary.profileId = 'Grandad'
  t.deepEqual(
    getters.nestedDescendants,
    expected,
    'importantRelationship means no duplicate children (grandad primary link)'
  )

  t.pass('set showExtendedFamily = true')
  state.view.changes.showExtendedFamily = true
  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'Grandma',
      children: [
        {
          id: 'Daughter',
          children: []
        },
        {
          id: 'Grandaughter',
          children: []
        }
      ]
    },
    'importantRelationship means no duplicate children (extendedFamily = true)'
  )

  t.end()
})

test('vuex/whakapapa getters.nestedDescendants (with importantRelationships - partner)', t => {
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
  const getters = Getters(state)

  const expected = {
    id: 'Parent',
    children: [
      { id: 'Son', children: [] },
      { id: 'Daughter', children: [] }
    ]
  }
  t.deepEqual(
    getters.nestedDescendants,
    expected,
    'with no importantRelationships, all partners are rendered as full nodes'
  )

  /* extendedFamily = true */
  // tests for watching for consistent behaviour
  state.view.changes.showExtendedFamily = true
  t.deepEqual(
    getters.nestedDescendants,
    expected,
    'with no importantRelationships, all partners are rendered as full nodes (extendedFamily)'
  )

  /* adding importantRelationships */
  // here we say the Daughter's relationship to the Son is the most important
  // this means she will turn up as a partner of son, but not a child of Parent
  // (that will be drawn as a lessImportantLink)
  state.view.importantRelationships = {
    Daughter: {
      profileId: 'Daughter',
      primary: { profileId: 'Son' }
    }
  }

  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'Parent',
      children: [
        {
          id: 'Son',
          children: []
        }
      ]
    },
    'importantRelationship means no duplicate partners'
  )

  // CASE : this scenario with Parent as primary link
  // unclear how that would be rendered...

  t.end()
})

test('vuex/whakapapa getters.nestedDescendants (marriage within tree)', t => {
  /* marriage within tree

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
    getters.nestedDescendants,
    {
      id: 'Grandma',
      children: [
        {
          id: 'Daughter',
          children: [
            { id: 'Grandaughter', children: [] }
          ]
        }
      ]
    }
  )

  t.pass('remove importantRelationship')
  state.view.importantRelationships = {}

  t.deepEqual(
    getters.nestedDescendants,
    {
      id: 'Grandma',
      children: [
        {
          id: 'Daughter',
          children: [
            { id: 'Grandaughter', children: [] }
          ]
        },
        {
          id: 'Son',
          children: [
            { id: 'Grandaughter', children: [] }
          ]
        }
      ]
    }
  )

  t.end()
})
