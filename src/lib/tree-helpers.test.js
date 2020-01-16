import tree from './tree-helpers'
const test = require('tape')

test('missing profile', t => {
  const profiles = {
    A: {
      id: 'A',
      name: 'grandad',
      parents: [],
      children: ['B'],
      siblings: []
    }
  }
  t.throws(
    () => tree.hydrate(profiles.A, profiles),
    'missing profile'
  )
  t.end()
})

test('parent hydration', t => {
  const profiles = {
    A: {
      id: 'A',
      name: 'grandad',
      parents: [],
      children: ['C'],
      siblings: []
    },
    B: {
      id: 'B',
      name: 'grandma',
      parents: [],
      children: ['C'],
      siblings: []
    },
    C: {
      id: 'C',
      name: 'mum',
      parents: ['A', 'B'],
      children: [],
      siblings: []
    }
  }
  const expected = {
    id: 'C',
    name: 'mum',
    parents: [
      {
        id: 'A',
        name: 'grandad',
        parents: [],
        children: ['C'],
        siblings: []
      },
      {
        id: 'B',
        name: 'grandma',
        parents: [],
        children: ['C'],
        siblings: []
      }
    ],
    children: [],
    siblings: []
  }
  const actual = tree.hydrate(profiles.C, profiles)
  t.deepEqual(actual, expected, 'hydration')
  t.end()
})

test('child hydration', t => {
  const profiles = {
    A: {
      id: 'A',
      name: 'mum',
      parents: [],
      children: ['B'],
      siblings: []
    },
    B: {
      id: 'B',
      name: 'child1',
      parents: ['A'],
      children: [],
      siblings: []
    }
  }
  const expected = {
    id: 'B',
    name: 'child1',
    parents: [
      {
        id: 'A',
        name: 'mum',
        parents: [],
        children: [ 'B' ],
        siblings: []
      }
    ],
    children: [],
    siblings: []
  }
  const actual = tree.hydrate(profiles.B, profiles)
  t.deepEqual(actual, expected, 'hydration')
  t.end()
})

test('sibling hydration', t => {
  const profiles = {
    A: {
      id: 'A',
      name: 'mum',
      parents: [],
      children: ['B', 'C'],
      siblings: []
    },
    B: {
      id: 'B',
      name: 'child1',
      parents: ['A'],
      children: [],
      siblings: ['C']
    },
    C: {
      id: 'C',
      name: 'child2',
      parents: ['A'],
      children: [],
      siblings: ['B']
    }
  }
  const expected = {
    id: 'B',
    name: 'child1',
    parents: [
      {
        id: 'A',
        name: 'mum',
        parents: [],
        children: ['B', 'C'],
        siblings: []
      }
    ],
    children: [],
    siblings: [
      {
        id: 'C',
        name: 'child2',
        parents: ['A'],
        children: [],
        siblings: ['B']
      }
    ]
  }
  const actual = tree.hydrate(profiles.B, profiles)
  t.deepEqual(actual, expected, 'hydration')
  t.end()
})

test('bornAt hydration', t => {
  const profiles = {
    A: {
      bornAt: '2019-01-01T00:00:00.000Z'
    }
  }
  const expected = { bornAt: '2019-01-01' }
  const actual = tree.hydrate(profiles.A, profiles)
  t.deepEqual(actual, expected, 'hydration')
  t.end()
})

test('diedAt hydration', t => {
  const profiles = {
    A: {
      diedAt: '2019-01-01T00:00:00.000Z'
    }
  }
  const expected = { diedAt: '2019-01-01' }
  const actual = tree.hydrate(profiles.A, profiles)
  t.deepEqual(actual, expected, 'hydration')
  t.end()
})

test('bornAt DEFAULT hydration', t => {
  const profiles = {
    A: {
      bornAt: '-005001-12'
    }
  }
  const expected = { bornAt: '' }
  const actual = tree.hydrate(profiles.A, profiles)
  t.deepEqual(actual, expected, 'hydration')
  t.end()
})

test('diedAt DEFAULT hydration', t => {
  const profiles = {
    A: {
      diedAt: '-005001-12'
    }
  }
  const expected = { diedAt: '' }
  const actual = tree.hydrate(profiles.A, profiles)
  t.deepEqual(actual, expected, 'hydration')
  t.end()
})