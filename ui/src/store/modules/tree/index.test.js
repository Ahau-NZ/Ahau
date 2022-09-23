import { _compareAge } from './index.js'

const test = require('tape')

test.only('_compareAge', t => {
  const children1 = [
    { created: 1, birthOrder: 1, age: 2 },
    { created: 2, birthOrder: 2, age: 3 }
  ]
  const expected1 = [
    { created: 1, birthOrder: 1, age: 2 },
    { created: 2, birthOrder: 2, age: 3 }
  ]
  t.deepEqual(
    children1.sort(_compareAge).map(el => el.created),
    expected1.map(el => el.created),
    'birth order wins'
  )

  const children2 = [
    { created: 1, birthOrder: undefined, age: 2 },
    { created: 2, birthOrder: 2, age: 3 }
  ]
  const expected2 = [
    { created: 2, birthOrder: 2, age: 3 },
    { created: 1, birthOrder: undefined, age: 2 }
  ]
  t.deepEqual(
    children2.sort(_compareAge).map(el => el.created),
    expected2.map(el => el.created),
    'birth order wins over age'
  )

  const children3 = [
    { created: 1, birthOrder: undefined, age: undefined },
    { created: 2, birthOrder: undefined, age: 3 },
    { created: 3, birthOrder: undefined, age: 2 },
    { created: 4, birthOrder: undefined, age: 4 }
  ]
  const expected3 = [
    { created: 1, birthOrder: undefined, age: undefined },
    { created: 4, birthOrder: undefined, age: 4 },
    { created: 2, birthOrder: undefined, age: 3 },
    { created: 3, birthOrder: undefined, age: 2 }
  ]
  t.deepEqual(
    children3.sort(_compareAge).map(el => el.created),
    expected3.map(el => el.created),
    'use age when birthOrder is not present'
  )

  const children4 = [
    { created: 1, birthOrder: undefined, age: 2 },
    { created: 2, birthOrder: undefined, age: undefined },
    { created: 3, birthOrder: undefined, age: 4 }
  ]
  const expected4 = [
    { created: 1, birthOrder: undefined, age: 2 },
    { created: 2, birthOrder: undefined, age: undefined },
    { created: 3, birthOrder: undefined, age: 4 }
  ]
  t.deepEqual(
    children4.sort(_compareAge).map(el => el.created),
    expected4.map(el => el.created),
    'do not sort if incomplete data'
  )

  const children = [
    { created: 1, birthOrder: 1, age: 4 },
    { created: 2, birthOrder: 2, age: 3 },
    { created: 3, birthOrder: undefined, age: 4 },
    { created: 4, birthOrder: 3, age: undefined },
    { created: 5, birthOrder: undefined, age: undefined },
    { created: 6, birthOrder: undefined, age: 5 },
    { created: 7, birthOrder: undefined, age: undefined }
  ]
  const expected = [
    { created: 1, birthOrder: 1, age: 4 },
    { created: 2, birthOrder: 2, age: 3 },
    { created: 4, birthOrder: 3, age: undefined },
    { created: 3, birthOrder: undefined, age: 4 },
    { created: 5, birthOrder: undefined, age: undefined },
    { created: 6, birthOrder: undefined, age: 5 },
    { created: 7, birthOrder: undefined, age: undefined }
  ]

  t.deepEqual(
    children.sort(_compareAge).map(el => el.created),
    expected.map(el => el.created)
  )
  t.end()
})
