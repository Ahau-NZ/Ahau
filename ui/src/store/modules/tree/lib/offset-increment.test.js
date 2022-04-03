import offsetIncrement from './offset-increment'

const test = require('tape')

// see ./README.md for clarification about partner layout
test('offsetIncrement', t => {
  t.equal(offsetIncrement(0, 1), 0)

  t.equal(offsetIncrement(0, 2), 0) // left 0
  t.equal(offsetIncrement(1, 2), 0) // right 0

  t.equal(offsetIncrement(0, 3), 0) // left 0
  t.equal(offsetIncrement(1, 3), 1) // left 1
  t.equal(offsetIncrement(2, 3), 0) // right 0

  t.equal(offsetIncrement(0, 4), 0) // left 0
  t.equal(offsetIncrement(1, 4), 1) // left 1
  t.equal(offsetIncrement(2, 4), 0) // right 0
  t.equal(offsetIncrement(3, 4), 1) // right 1

  t.equal(offsetIncrement(0, 5), 0) // left 0
  t.equal(offsetIncrement(1, 5), 1) // left 1
  t.equal(offsetIncrement(2, 5), 2) // left 2
  t.equal(offsetIncrement(3, 5), 0) // right 0
  t.equal(offsetIncrement(4, 5), 1) // right 1

  t.end()
})
