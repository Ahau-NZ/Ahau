import findSuccessor from './find-successor'
const test = require('tape')

test('find-succesor', t => {
  t.deepEqual(
    findSuccessor({
      partners: [{ id: '%partner' }],
      children: [{ id: '%B' }, { id: '%C' }]
    }),
    { id: '%partner' },
    'if only one partner, they are the successor'
  )
  t.equal(
    findSuccessor({
      partners: [{ id: '%partner' }, { id: '%partner2' }],
      children: [{ id: '%B' }, { id: '%C' }]
    }),
    false,
    'if multiple partners, no successor'
  )

  t.deepEqual(
    findSuccessor({
      partners: [],
      children: [{ id: '%onlyChild' }]
    }),
    { id: '%onlyChild' },
    'if no partners and only one child, this person is successor'
  )
  t.equal(
    findSuccessor({
      partners: [],
      children: [{ id: '%B' }, { id: '%C' }]
    }),
    false,
    'if no partners, but multiple children, no successor'
  )

  t.equal(
    findSuccessor({
      partners: [],
      children: []
    }),
    false,
    'if no partners nor children ... no successor'
  )

  t.throws(
    () => {
      findSuccessor({
        children: [{ id: '%B' }, { id: '%C' }]
      })
    },
    /profile missing partners field/,
    'if no partners field missing, throws'
  )
  t.throws(
    () => {
      findSuccessor({
        partners: [{ id: '%B' }, { id: '%C' }]
      })
    },
    /profile missing children field/,
    'if no children field missing, throws'
  )

  t.end()
})
