import tree from './tree-helpers'
const test = require('tape')

test('flatten', t => {
  const person = {
    id: 'A',
    preferredName: 'dad',

    parents: [
      {
        profile: {
          id: 'B',
          preferredName: 'grandad'
        },
        relationshipType: 'birth'
      }
    ],

    children: [
      {
        profile: {
          id: 'C',
          preferredName: 'son'
        },
        relationshipType: 'birth'
      },
      {
        profile: {
          id: 'D',
          preferredName: 'daughter'
        },
        relationshipType: 'whangai'
      }
    ]
  }

  // TODO
  // currently relationshipType is totally lost in flattening
  // changing this will likely require changing the data strucuture
  // which may result in change to vue layer
  const expected = {
    A: {
      id: 'A',
      preferredName: 'dad',
      parents: ['B'],
      children: ['C', 'D']
    },
    B: {
      id: 'B',
      preferredName: 'grandad'
      // parents: [],
      // children: ['A']
    },
    C: {
      id: 'C',
      preferredName: 'son'
      // parents: ['A'],
      // children: []
    },
    D: {
      id: 'D',
      preferredName: 'daughter'
      // parents: ['A'],
      // children: []
    }
  }

  t.deepEqual(tree.flatten(person), expected, 'flattens the nesting!')

  t.end()
})

test('hydrate', t => {
  /* parent hydration */
  const profilesParents = {
    A: {
      id: 'A',
      preferredName: 'grandad',
      parents: [],
      children: ['C'],
      siblings: []
    },
    B: {
      id: 'B',
      preferredName: 'grandma',
      parents: [],
      children: ['C'],
      siblings: []
    },
    C: {
      id: 'C',
      preferredName: 'mum',
      parents: ['A', 'B'],
      children: [],
      siblings: []
    }
  }
  const expectedParents = {
    id: 'C',
    preferredName: 'mum',
    parents: [
      {
        id: 'A',
        preferredName: 'grandad',
        parents: [],
        children: ['C'],
        siblings: []
      },
      {
        id: 'B',
        preferredName: 'grandma',
        parents: [],
        children: ['C'],
        siblings: []
      }
    ],
    children: [],
    siblings: []
  }
  t.deepEqual(
    tree.hydrate(profilesParents.C, profilesParents),
    expectedParents,
    'hydrates parents'
  )

  /* child hydration */
  const profilesChildren = {
    A: {
      id: 'A',
      preferredName: 'mum',
      parents: [],
      children: ['B'],
      siblings: []
    },
    B: {
      id: 'B',
      preferredName: 'child1',
      parents: ['A'],
      children: [],
      siblings: []
    }
  }
  const expectedChildren = {
    id: 'B',
    preferredName: 'child1',
    parents: [
      {
        id: 'A',
        preferredName: 'mum',
        parents: [],
        children: ['B'],
        siblings: []
      }
    ],
    children: [],
    siblings: []
  }
  t.deepEqual(
    tree.hydrate(profilesChildren.B, profilesChildren),
    expectedChildren,
    'hydrates children'
  )

  /* sibling hydration */
  const profilesSiblings = {
    A: {
      id: 'A',
      preferredName: 'mum',
      parents: [],
      children: ['B', 'C'],
      siblings: []
    },
    B: {
      id: 'B',
      preferredName: 'child1',
      parents: ['A'],
      children: [],
      siblings: ['C']
    },
    C: {
      id: 'C',
      preferredName: 'child2',
      parents: ['A'],
      children: [],
      siblings: ['B']
    }
  }
  const expectedSiblings = {
    id: 'B',
    preferredName: 'child1',
    parents: [
      {
        id: 'A',
        preferredName: 'mum',
        parents: [],
        children: ['B', 'C'],
        siblings: []
      }
    ],
    children: [],
    siblings: [
      {
        id: 'C',
        preferredName: 'child2',
        parents: ['A'],
        children: [],
        siblings: ['B']
      }
    ]
  }
  t.deepEqual(
    tree.hydrate(profilesSiblings.B, profilesSiblings),
    expectedSiblings,
    'hydrates siblings'
  )

  /* missing profiles */
  const profilesMissing = {
    A: {
      id: 'A',
      preferredName: 'grandad',
      parents: [],
      children: ['B'],
      siblings: []
    }
  }
  t.throws(
    () => tree.hydrate(profilesMissing.A, profilesMissing),
    'throws if missing missing profile'
  )

  t.end()
})

test('update node', t => {
  // update a node in an empty tree
  t.deepEqual(
    tree.updateNode(undefined, { id: 'A', preferredName: 'A' }),
    {},
    'when nestedWhakapapa = undefined'
  )

  t.deepEqual(
    tree.updateNode(null, { id: 'A', preferredName: 'A' }),
    {},
    'when nestedWhakapapa = null'
  )

  t.deepEqual(
    tree.updateNode({}, { id: 'A', preferredName: 'A' }),
    {},
    'when nested whakapapa = {}'
  )

  t.deepEqual(
    tree.updateNode(1, { id: 'A', preferredName: 'A' }),
    {},
    'when nestedWhakapapa = number1'
  )

  t.deepEqual(
    tree.updateNode({ id: 'A' }, { id: 'A', preferredName: 'A' }),
    { id: 'A', preferredName: 'A' },
    'the root node fields'
  )

  t.deepEqual(
    tree.updateNode({ id: 'A', children: [{ id: 'B' }] }, { id: 'B', preferredName: 'BBB' }),
    { id: 'A', children: [{ id: 'B', preferredName: 'BBB' }] },
    'update a child of the root node'
  )

  const deeplyNestedWhakapapa = {
    id: 'A',
    children: [
      {
        id: 'B',
        children: [
          {
            id: 'C'
          }
        ]
      }
    ]
  }

  t.deepEqual(
    tree.updateNode(deeplyNestedWhakapapa, { id: 'C', preferredName: 'C' }),
    {
      id: 'A',
      children: [
        {
          id: 'B',
          children: [
            {
              id: 'C',
              preferredName: 'C'
            }
          ]
        }
      ]
    },
    'deeply nested update'
  )

  t.end()
})

test('add partner', t => {
  t.deepEqual(
    tree.addPartner({ id: 'A' }, { id: 'A' }, { id: 'B' }),
    {
      id: 'A',
      partners: [{ id: 'B' }]
    },
    ''
  )

  t.end()
})
