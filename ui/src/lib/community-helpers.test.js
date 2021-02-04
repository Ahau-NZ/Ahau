import { EMPTY_COMMUNITY, setDefaultCommunity } from './community-helpers.js'
import { getObjectChanges } from './get-object-changes.js'

const test = require('tape')

const communityInitial = setDefaultCommunity(EMPTY_COMMUNITY)

const communityUpdated = {
  preferredName: 'Eriepa Whanau',
  avatarImage: null,
  headerImage: null,
  description: 'This is the whanau',
  location: 'NZ',
  address: null,
  email: null,
  phone: null
}

test('create new community (empty)', t => {
  t.plan(1)
  const emptyCommunityChanges = getObjectChanges(communityInitial, communityInitial)
  t.deepEqual(emptyCommunityChanges, {}, 'no changes returns an empty object')
})

test.only('create new community (properties)', t => {
  t.plan(1)

  const propertyCommunityChanges = getObjectChanges(communityInitial, communityUpdated)
  const expectedStory = {
    preferredName: 'Eriepa Whanau',
    avatarImage: null,
    headerImage: null,
    description: 'This is the whanau',
    location: 'NZ',
    address: null,
    email: null,
    phone: null
  }

  t.deepEqual(propertyCommunityChanges, expectedStory, 'returns all the changed properties')
})
