import { dateIntervalToString, dateToString, edtfToDateString, formatSubmissionDate } from './date-helpers.js'
const test = require('tape')

test('dateTest', t => {
  t.plan(9)
  const initial = ['20XX-02-28/', '201X/202X', '1987-03-XX/2100', '1800-XX/198X-05', '1987-XX-04/', '/1999-02-14', '/', null, '1999/1999']

  var expected = ['28 Feb 20XX', '201X - 202X', 'Mar 1987 - 2100', '1800 - May 198X', '1987', '14 Feb 1999', '', '', '1999']

  initial.forEach((interval, i) => {
    t.equal(dateIntervalToString(interval), expected[i])
  })
})

test('dateToString', t => {
  t.plan(10)

  t.deepEqual(dateToString('2020-11-25'), '25 Nov 2020', 'Date correctly converted to string')

  t.deepEqual(dateToString('2020'), '2020', 'Only year sent')
  t.deepEqual(dateToString('2020-XX'), '2020', 'Only year sent')

  t.deepEqual(dateToString('2020-02'), 'Feb 2020', 'Only year and month sent')
  t.deepEqual(dateToString('2020-02-XX'), 'Feb 2020', 'Only year and month sent')

  t.deepEqual(dateToString('-'), '', 'incorrect format sent')
  t.deepEqual(dateToString('-1990'), '-1990', 'incorrect format sent')

  t.deepEqual(dateToString(null), '', 'null value correctly handled')
  t.deepEqual(dateToString(), '', 'undefined date correctly handled')
  t.deepEqual(dateToString(''), '', 'empty string correctly handled')
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

test('format-submission-date', t => {
  t.plan(7)

  t.deepEqual(formatSubmissionDate('1990-02-28'), '28 Feb 1990', 'Correct date (28 Feb 1990)')
  t.deepEqual(formatSubmissionDate('1990-02'), 'Feb 1990', 'Correct date (Feb 1990)')
  t.deepEqual(formatSubmissionDate('1990'), '1990', 'Correct date (1990)')

  t.deepEqual(formatSubmissionDate(''), '', 'Empty string correctly returning an empty string')
  t.deepEqual(formatSubmissionDate(), '', 'No arguments correctly returning an empty string')
  t.deepEqual(formatSubmissionDate(null), '', 'null correctly returning an empty string')

  t.deepEqual(formatSubmissionDate('string'), 'NaN undefined NaN', 'Invalid formatting of date')
})
