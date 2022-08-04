import { EMPTY_COMMUNITY, setDefaultCommunity, getDefaultFields, DEFAULT_PROFILE_MODEL, getCustomFields } from './community-helpers.js'
import { getObjectChanges } from './get-object-changes.js'

const test = require('tape')

const communityInitial = setDefaultCommunity(EMPTY_COMMUNITY)

const communityUpdated = {
  preferredName: 'Eriepa Whanau',
  avatarImage: null,
  headerImage: null,
  description: 'This is the whanau',
  address: null,
  email: null,
  phone: null,
  joiningQuestions: [
    { type: 'input', label: 'What is your iwi?' },
    { type: 'input', label: 'Where were you born?' }
  ],
  authors: []
}

test('get changes from a new community', t => {
  t.plan(1)
  const emptyCommunityChanges = getObjectChanges(communityInitial, communityInitial)
  t.deepEqual(emptyCommunityChanges, {}, 'no changes returns an empty object')
})

test('create new community', t => {
  t.plan(1)

  const propertyCommunityChanges = getObjectChanges(communityInitial, communityUpdated)
  const expectedCommunity = {
    preferredName: 'Eriepa Whanau',
    description: 'This is the whanau',
    joiningQuestions: [
      { type: 'input', label: 'What is your iwi?' },
      { type: 'input', label: 'Where were you born?' }
    ]
  }

  t.deepEqual(propertyCommunityChanges, expectedCommunity, 'returns all the changed properties')
})

test('get changes from an existing community', t => {
  t.plan(1)

  const newUpdate = {
    preferredName: 'Eriepa Family', // updated
    avatarImage: null,
    headerImage: null,
    description: 'This is the whanau',
    city: 'Waikato', // updated
    country: 'NZ', // updated
    address: '123 Some Street',
    email: 'whanau@email.com',
    phone: '0800 123 4567',
    joiningQuestions: [ // note: joiningQuestions will always be overwritten
      { type: 'input', label: 'What is your iwi?' },
      { type: 'input', label: 'Where were you born?' },
      { type: 'input', label: 'What is the time?' } // update
    ],
    authors: [{ feedId: 'A' }] // updated
  }

  const updatedChanges = getObjectChanges(communityUpdated, newUpdate)

  const expectedCommunity = {
    preferredName: 'Eriepa Family',
    city: 'Waikato',
    country: 'NZ',
    address: '123 Some Street',
    email: 'whanau@email.com',
    phone: '0800 123 4567',
    joiningQuestions: [
      { type: 'input', label: 'What is your iwi?' },
      { type: 'input', label: 'Where were you born?' },
      { type: 'input', label: 'What is the time?' }
    ],
    authors: {
      add: [{ feedId: 'A' }]
    }
  }

  t.deepEqual(updatedChanges, expectedCommunity, 'returns updated changes')
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

  // write a method which handles duplicates

  t.end()
})
