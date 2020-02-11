import calculateAge from './calculate-age'
const test = require('tape')

test('calculate-age', t => {
  const now = new Date('2020-01-30')

  t.equal(calculateAge(null, now), null, 'null')
  t.equal(calculateAge('2010-01-01', now), 10, '<= 12')
  t.equal(calculateAge('1980-01-01', now), 40, '13 - 49')
  t.equal(calculateAge('1960-01-01', now), 60, '50+')
  t.equal(calculateAge('1900-01-01', now), 120, 'Really old')
  t.end()
})
