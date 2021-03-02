import { getDisplayName } from './person-helpers.js'
const test = require('tape')

test('get display name', t => {
  t.deepEqual(
    getDisplayName({ preferredName: null, legalName: null }),
    '?',
    'null names = ?'
  )

  t.deepEqual(
    getDisplayName({ preferredName: '', legalName: '' }),
    '?',
    'empty names = ?'
  )

  t.deepEqual(
    getDisplayName({ preferredName: '', legalName: null }),
    '?',
    'empty preferredName and null legalName = ?'
  )

  t.deepEqual(
    getDisplayName({ preferredName: null, legalName: '' }),
    '?',
    'null preferredName and empty legalName = ?'
  )

  t.deepEqual(
    getDisplayName({ preferredName: null, legalName: 'Cherese Eriepa' }),
    'Cherese Eriepa',
    'null preferredName and legalName = legalName'
  )

  t.deepEqual(
    getDisplayName({ preferredName: '', legalName: 'Cherese Eriepa' }),
    'Cherese Eriepa',
    'empty preferredName and legalName = legalName'
  )

  t.deepEqual(
    getDisplayName({ preferredName: 'Cherese', legalName: 'Cherese Eriepa' }),
    'Cherese',
    'preferredName and legalName = preferredName'
  )

  t.deepEqual(
    getDisplayName({ preferredName: 'Cherese', legalName: '' }),
    'Cherese',
    'preferredName and empty legalName = preferredName'
  )

  t.deepEqual(
    getDisplayName({ preferredName: 'Cherese', legalName: null }),
    'Cherese',
    'preferredName and null legalName = preferredName'
  )

  t.end()
})
