import calculateAge from './calculate-age'
const test = require('tape')

test('calculate-age', t => {
  const now = new Date('2020-06-17')

  t.equal(calculateAge(null, now), null, 'null')
  t.equal(calculateAge('2010-01-01/', now), 10, '<= 12')
  t.equal(calculateAge('198X-01-01/', now), 40, '13 - 49')
  t.equal(calculateAge('1960-XX-01/', now), 60, '50+')
  t.equal(calculateAge('19XX-01-01/', now), 120, 'Really old')
  t.equal(calculateAge('/2020-06-16', now), 0, 'no date of birth')
  t.equal(calculateAge('1995/', now), 25, 'just a year')
  t.end()
})
