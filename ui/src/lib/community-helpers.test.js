import { EMPTY_COMMUNITY, setDefaultCommunity } from './community-helpers.js'
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
