import test from 'tape'
import { getDisplayName } from './person-helpers.mjs'

test('get display name', t => {
  t.deepEqual(
    getDisplayName({ preferredName: null, legalName: null }),
    'Unknown',
    'null names = Unknown'
  )

  t.deepEqual(
    getDisplayName({ preferredName: '', legalName: '' }),
    'Unknown',
    'empty names = Unknown'
  )

  t.deepEqual(
    getDisplayName({ preferredName: '', legalName: null }),
    'Unknown',
    'empty preferredName and null legalName = Unknown'
  )

  t.deepEqual(
    getDisplayName({ preferredName: null, legalName: '' }),
    'Unknown',
    'null preferredName and empty legalName = Unknown'
  )

  t.deepEqual(
    getDisplayName({ preferredName: null, legalName: 'Cherese Eriepa' }),
    'Cherese',
    'null preferredName and legalName = legalName'
  )

  t.deepEqual(
    getDisplayName({ preferredName: '', legalName: 'Cherese Eriepa' }),
    'Cherese',
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
