import formatDate from './format-date'
const test = require('tape')

test('format-date', t => {
  t.plan(6)

  t.deepEqual(formatDate('1990-02-28'), '28 Feb 1990', 'Correct date (28 Feb 1990)')
  t.deepEqual(formatDate('1990-02'), 'Feb 1990', 'Correct date (Feb 1990)')
  t.deepEqual(formatDate('1990'), '1990', 'Correct date (1990)')

  t.throws(
    () => { formatDate('') },
    /Cannot format an empty string/,
    'Empty string passed to formatDate()'
  )
  t.throws(
    () => { formatDate() },
    /Cannot format an undefined value/,
    'No arguments passed to formatDate()'
  )

  t.deepEqual(formatDate('string'), 'NaN undefined NaN', 'Invalid formatting of date')
})
