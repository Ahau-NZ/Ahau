import { calculateAge } from './avatar-helpers'
const test = require('tape')

test('age', t => {
  const bornAt = '1995-07-24'
  const expected = 24

  t.deepEqual(
    calculateAge(bornAt),
    expected,
    'age test'
  )
  t.end()
})
