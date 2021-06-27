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
    tree.addPartner({ id: 'A', partners: [] }, { id: 'A' }, { id: 'B' }),
    {
      id: 'A',
      partners: [{ id: 'B' }]
    },
    ''
  )

  t.end()
})

test('Tree', t => {
  // add child to root node
  const parent = {
    id: 'A',
    children: []
  }

  const child = { id: 'B' }
  const grandchild1 = { id: 'D' }

  // add first child
  t.deepEqual(
    tree.addChild(parent, child, parent),
    {
      id: 'A',
      children: [child]
    },
    'adds child to root node'
  )

  const nestedWhakapapa = {
    id: 'C',
    children: [
      {
        ...child,
        children: []
      }
    ]
  }

  const withOneGrandchild = {
    id: 'C',
    children: [
      {
        ...child,
        children: [
          grandchild1
        ]
      }
    ]
  }

  // add first grandchild
  t.deepEqual(
    tree.addChild(nestedWhakapapa, grandchild1, child),
    withOneGrandchild,
    'adds grandchild'
  )

  const grandchild2 = { id: 'E' }

  const withTwoGrandchildren = {
    id: 'C',
    children: [
      {
        ...child,
        children: [
          {
            id: 'D',
            siblings: [grandchild2]
          },
          grandchild2
        ]
      }
    ]
  }

  t.deepEqual(
    tree.addChild(withOneGrandchild, grandchild2, child),
    withTwoGrandchildren,
    'adds second grandchild'
  )

  t.end()
})
