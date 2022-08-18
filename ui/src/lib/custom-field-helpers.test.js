import { getDefaultFields, DEFAULT_PROFILE_MODEL, getCustomFields, findMissingRequiredFields } from './custom-field-helpers'

const test = require('tape')

test('pick fields (empty custom fields)', t => {
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

test('pick fields from custom fields', t => {
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

  const defaultFields = DEFAULT_PROFILE_MODEL
  defaultFields[1] = customFields[0]

  t.deepEqual(
    getDefaultFields(customFields),
    defaultFields,
    'returns the default fields including the one that was updated'
  )

  t.deepEqual(
    getCustomFields(customFields),
    [
      customFields[1]
    ],
    'returns the custom fields from a set containing both custom and default custom ones'
  )

  t.end()
})

test('pick fields from custom fields (duplicates labels)', t => {
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
      visibleBy: 'members'
    }
  ]

  t.deepEqual(
    getDefaultFields(customFields).find(field => field.label === 'full name'),
    {
      key: '1657665746447',
      label: 'full name',
      required: true,
      type: 'text',
      visibleBy: 'members'
    },
    'returns the default fields that isnt a tombstone, removing duplicate labels'
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
