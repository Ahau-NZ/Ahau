import { dateIntervalToString, edtfToDateString } from './date-helpers.js'
const test = require('tape')

test('dateTest', t => {
  t.plan(9)
  const initial = ['20XX-02-28/', '201X/202X', '1987-03-XX/2100', '1800-XX/198X-05', '1987-XX-04/', '/1999-02-14', '/', null, '1999/1999']

  var expected = ['28 Feb 20XX', '201X - 202X', 'Mar 1987 - 2100', '1800 - May 198X', '1987', '14 Feb 1999', '', '', '1999']

  initial.forEach((interval, i) => {
    t.equal(dateIntervalToString(interval), expected[i])
  })
})

test('edtfToDate', t => {
  t.plan(10)

  t.deepEqual(edtfToDateString(null), '')
  t.deepEqual(edtfToDateString(''), '')
  t.deepEqual(edtfToDateString('dog'), undefined)
  t.deepEqual(edtfToDateString('20XX-02-28/'), new Date('2000-02-28'))
  t.deepEqual(edtfToDateString('201X/202X'), new Date('2010-01-01'))
  t.deepEqual(edtfToDateString('1987-03-XX/2100'), new Date('1987-03-01'))
  t.deepEqual(edtfToDateString('1800-XX/198X-05'), new Date('1800-01-01'))
  t.deepEqual(edtfToDateString('1987-XX-04/'), new Date('1987-01-04'))
  t.deepEqual(edtfToDateString('/1999-02-14'), new Date('1999-02-14'))
  t.deepEqual(edtfToDateString('1998/1999'), new Date('1998-01-01'))
})
