import test from 'tape'

import {
  getDefaultFields,
  DEFAULT_PROFILE_MODEL,
  getCustomFields,
  findMissingRequiredFields,
  getInitialCustomFieldChanges,
  getCustomFieldChanges
} from './custom-field-helpers.mjs'

const FIELD_DEFS = [
  {
    key: '1657665746447',
    label: 'full name',
    required: true,
    type: 'text',
    visibleBy: 'members'
  },
  {
    key: '1657464476657',
    label: 'First pets name',
    required: true,
    type: 'text',
    visibleBy: 'members'
  },
  {
    key: '1476466577564',
    label: 'Pets favourite treats',
    required: false,
    type: 'array',
    visibleBy: 'members'
  },
  {
    key: '1452341465646',
    label: 'Date joined',
    required: true,
    type: 'date',
    visibleBy: 'members'
  }
]

test('getDefaultFields + getCustomFields (empty)', t => {
  const defaultFields = DEFAULT_PROFILE_MODEL

  t.deepEqual(
    getDefaultFields([]),
    defaultFields,
    'returns the default fields including the one that was updated'
  )

  t.deepEqual(
    getCustomFields([]),
    [],
    'returns the custom fields from a set containing both custom and default custom ones'
  )

  t.end()
})

test('getDefaultFields (non-empty)', t => {
  const customFields = [
    {
      key: '1690502653223',
      label: 'A',
      type: 'text',
      required: false,
      visibleBy: 'members',
      tombstone: null,
      __typename: 'CommunityCustomField'
    },
    {
      key: '1690502659077',
      label: 'B',
      type: 'text',
      required: false,
      visibleBy: 'members',
      tombstone: null,
      __typename: 'CommunityCustomField'
    }
  ]

  t.deepEqual(
    getDefaultFields(customFields),
    DEFAULT_PROFILE_MODEL,
    'works with untombstoned customFields'
  )

  customFields[0].tombstone = { date: Date.now() }
  t.deepEqual(
    getDefaultFields(customFields),
    DEFAULT_PROFILE_MODEL,
    'works with tombstoned customFields'
  )
  customFields[1].tombstone = { date: Date.now() }
  t.deepEqual(
    getDefaultFields(customFields),
    DEFAULT_PROFILE_MODEL,
    'works with tombstoned customFields'
  )

  t.end()
})

test('getDefaultFields (tombstone a default field)', t => {
  const label = 'birth order'
  t.true(
    DEFAULT_PROFILE_MODEL.find(f => f.label === label),
    label + ' is a default field'
  )
  const customFields = [
    {
      key: '1657665746447',
      label,
      required: true,
      type: 'text',
      visibleBy: 'members',
      tombstone: {
        date: new Date()
      }
    }
  ]

  t.deepEqual(
    getDefaultFields(customFields).find(field => field.label === label),
    undefined,
    'can tombstone that default field'
  )

  t.end()
})

test('getDefaultFields (duplicate field label, one active)', t => {
  const customFields = [
    {
      key: '1657665746445',
      label: 'full name',
      required: true,
      type: 'text',
      visibleBy: 'members',
      tombstone: {
        date: new Date()
      }
    },
    {
      key: '1657665746447',
      label: 'full name',
      required: true,
      type: 'text',
      visibleBy: 'members',
      tombstone: null // << the active one!
    },
    {
      key: '1657665746449',
      label: 'full name',
      required: true,
      type: 'text',
      visibleBy: 'members',
      tombstone: {
        date: new Date()
      }
    }
  ]

  t.deepEqual(
    getDefaultFields(customFields).find(field => field.label === 'full name'),
    {
      key: '1657665746447',
      label: 'full name',
      required: true,
      type: 'text',
      visibleBy: 'members',
      tombstone: null // << the active one!
    },
    'returns the default fields that isnt a tombstone, removing duplicate labels'
  )

  t.end()
})

test('getCustomFields', t => {
  const customFields = [
    { // default one
      key: '1657665746445',
      label: 'full name',
      required: true,
      type: 'text',
      visibleBy: 'members'
    },
    {
      key: '1746666455457',
      label: 'favourite song',
      required: true,
      type: 'text',
      visibleBy: 'members'
    }
  ]

  // MUTATING CONST
  const originalField = DEFAULT_PROFILE_MODEL[1]
  DEFAULT_PROFILE_MODEL[1] = customFields[0]
  // makes the second default field "full name" instead of "first name"

  t.deepEqual(
    getDefaultFields(customFields).map(f => f.label),
    DEFAULT_PROFILE_MODEL.map(f => f.label),
    'returns all the default field labels including the one that was updated'
  )

  t.deepEqual(
    getCustomFields(customFields),
    [
      customFields[1]
    ],
    'returns the custom fields from a set containing both custom fields + default (mutated) fields'
  )

  // REVERSING MUTATION
  DEFAULT_PROFILE_MODEL[1] = originalField

  t.end()
})

// this test may be a repeat of the test above it :shrugs:
test('getCustomFields (non-empty)', t => {
  const customFields = [
    {
      key: '1690502653223',
      label: 'A',
      type: 'text',
      required: false,
      visibleBy: 'members',
      tombstone: null,
      __typename: 'CommunityCustomField'
    },
    {
      key: '1690502659077',
      label: 'B',
      type: 'text',
      required: false,
      visibleBy: 'members',
      tombstone: null,
      __typename: 'CommunityCustomField'
    }
  ]

  t.deepEqual(
    getCustomFields(customFields),
    customFields,
    'works with untombstoned customFields'
  )

  customFields[0].tombstone = { date: Date.now() }
  t.deepEqual(
    getCustomFields(customFields),
    [customFields[1]],
    'works with tombstoned customFields'
  )

  customFields[1].tombstone = { date: Date.now() }
  t.deepEqual(
    getCustomFields(customFields),
    [],
    'works with tombstoned customFields'
  )

  t.end()
})

test('getCustomFields (orders by key)', t => {
  const customFields = [
    {
      key: '1746666455457', // later
      label: 'favourate song',
      required: true,
      type: 'text',
      visibleBy: 'members'
    },
    {
      key: '1657665746445', // earlier
      label: 'favourate band',
      required: true,
      type: 'text',
      visibleBy: 'members'
    }
  ]

  t.deepEqual(
    getCustomFields(customFields).map(f => f.label),
    ['favourate band', 'favourate song'],
    'returns customFields in order of keys (asserted datetime created)'
  )

  t.end()
})

test('required fields', t => {
  const requiredFields = [
    {
      key: '1657665746447',
      label: 'full name',
      required: true,
      type: 'text',
      visibleBy: 'members'
    },
    {
      key: '1657464476657',
      label: 'First pets name',
      required: true,
      type: 'text',
      visibleBy: 'members'
    }
  ]

  const profile = {
    legalName: null
  }

  t.deepEqual(
    findMissingRequiredFields(profile, requiredFields),
    [{ prop: 'full name' }, { prop: 'First pets name' }],
    'returns the missing required field'
  )

  t.end()
})

test('getInitialCustomFieldChanges', t => {
  const rawCustomFields = {
    1657665746447: '',
    1657464476657: 'Snowy',
    1476466577564: ['i dont know'],
    1452341465646: '2020-XX-XX'
  }

  t.deepEqual(
    getInitialCustomFieldChanges(rawCustomFields, FIELD_DEFS),
    [
      { key: '1657464476657', value: 'Snowy' },
      { key: '1476466577564', value: ['i dont know'] },
      { key: '1452341465646', value: '2020-XX-XX', type: 'date' }
    ],
    'returns the fields that changed from their default values'
  )

  t.end()
})

test('getCustomFieldChanges', t => {
  const profileCustomFields = [
    { key: '1657464476657', value: 'Snowy' },
    { key: '1476466577564', value: ['i dont know'] }
  ]

  const updatedCustomFields = {
    1657665746447: 'Cherese Eriepa',
    1657464476657: 'Snowy',
    1476466577564: []
  }

  t.deepEqual(
    getCustomFieldChanges(profileCustomFields, updatedCustomFields, FIELD_DEFS),
    [
      { key: '1657665746447', value: 'Cherese Eriepa' },
      { key: '1476466577564', value: [] }
    ],
    'returns the fields that changed from the profiles previous value'
  )

  t.end()
})
