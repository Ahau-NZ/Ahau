import { EMPTY_STORY, setDefaultStory } from './story-helpers.js'
import { getObjectChanges } from './get-object-changes.js'
import { personComplete } from '../mocks/person-profile.js'
import clone from 'lodash.clonedeep'
const test = require('tape')

const storyInitial = setDefaultStory(EMPTY_STORY)

const storyMinimal = {
  title: 'Title',
  description: 'Description',
  location: 'Aotearoa',
  locationDescription: 'The land of the long white cloud',
  contributionNotes: 'Kia ora',
  format: 'FORMAT',
  identifier: 'ID',
  source: 'SRC',
  language: 'Maaori',
  translation: 'N/A',
  culturalNarrative: 'N/A',

  timeInterval: '1900/2020',
  submissionDate: '2020-07-08'
}

const { children, parents } = personComplete

const storyComplete = {
  // ...storyMinimal,
  mentions: [...children],
  creators: [...children],
  // categories: [],
  // collections: [],
  // access: [],
  contributors: [...children]
  // protocols: [],
  // relatedRecords: [],
  // artefacts: [],
}

test('create new story (empty)', t => {
  t.plan(1)
  const emptyStoryChanges = getObjectChanges(storyInitial, storyInitial)
  t.deepEqual(emptyStoryChanges, {}, 'no changes returns an empty object')
})

test('create new story (properties)', t => {
  t.plan(1)

  const propertyStoryChanges = getObjectChanges(storyInitial, storyMinimal)
  const expectedStory = {
    title: 'Title',
    description: 'Description',
    location: 'Aotearoa',
    locationDescription: 'The land of the long white cloud',
    contributionNotes: 'Kia ora',
    format: 'FORMAT',
    identifier: 'ID',
    source: 'SRC',
    language: 'Maaori',
    translation: 'N/A',
    culturalNarrative: 'N/A',
    timeInterval: '1900/2020',
    submissionDate: '2020-07-08'
  }

  t.deepEqual(propertyStoryChanges, expectedStory, 'returns all the changed properties')
})

test('create/update new story (arrays)', t => {
  t.plan(5)

  const arrayStoryChanges = getObjectChanges(storyInitial, storyComplete)

  const expectedArray = {
    add: [...children]
  }
  t.deepEqual(arrayStoryChanges, {
    mentions: expectedArray,
    contributors: expectedArray,
    creators: expectedArray
  }, 'returns all the changed arrays in format array: { add: [...], remove: [...] }')

  const storyUpdated = clone(storyComplete)

  storyUpdated.mentions.splice(0, 1) // remove first mention
  storyUpdated.mentions.push(parents[0]) // add a profile in

  storyUpdated.contributors.splice(1, 1)

  const updatedStoryChanges = getObjectChanges(storyComplete, storyUpdated)

  t.deepEqual(updatedStoryChanges.mentions, {
    add: [parents[0]],
    remove: [children[0]]
  }, 'contains mentioned profile to be added and removed')

  t.deepEqual(updatedStoryChanges.contributors, {
    remove: [children[1]]
  }, 'contains contributor profile to be removed')

  // add another three to mentions that are duplicates
  const storyUpdated2 = clone(storyUpdated)
  const parent = parents[1]

  storyUpdated2.mentions.push(parent)
  storyUpdated2.mentions.push(parent)
  storyUpdated2.mentions.push(parent)

  const updatedStory2Changes = getObjectChanges(storyUpdated, storyUpdated2)

  t.true(updatedStory2Changes.mentions.add.length === 1, 'returns correct amount of mentions, removing duplicates')
  t.deepEqual(updatedStory2Changes.mentions.add[0], parent, 'returns correct mentioned profile')
})

test('test item changes are correctly computed', t => {
  t.plan(1)

  const addChildren = [
    {
      id: '1',
      preferredName: 'Wahine',
      gender: 'female',
      aliveInterval: '1980-01-01/',
      children: [
        {
          id: '2',
          preferredName: 'Kotiro',
          legalName: 'Kotiro',
          gender: 'female',
          aliveInterval: '2008-01-01/'
        },
        {
          id: '3',
          preferredName: 'Tama',
          legalName: 'Tama',
          gender: 'male',
          aliveInterval: '2008-01-01/'
        }
      ]
    },
    {
      id: '4',
      preferredName: 'Tane',
      legalName: 'Tane',
      gender: 'male',
      aliveInterval: '1980-01-01/'
    }
  ]

  const removePartners = [
    {
      id: '5',
      preferredName: 'Koro',
      legalName: 'Koro',
      gender: 'male',
      aliveInterval: '1950-01-01/'
    }
  ]

  const initialSiblings = [{
    id: '1',
    preferredName: 'Koro',
    legalName: 'Koro',
    gender: 'male',
    aliveInterval: '1950-01-01/'
  }]

  const updatedSiblings = [{
    id: '2',
    preferredName: 'Test',
    legalName: 'Test',
    gender: 'female',
    aliveInterval: '160-02-28/'
  }]

  const initialTestValue = {
    title: 'value1',
    children: [],
    partners: removePartners,
    siblings: initialSiblings
  }

  const updatedTestValue = {
    title: 'value2',
    children: addChildren,
    partners: [],
    siblings: updatedSiblings
  }

  const expectedChanges = {
    title: 'value2',
    children: { add: addChildren },
    partners: { remove: removePartners },
    siblings: { add: updatedSiblings, remove: initialSiblings }
  }

  t.deepEqual(getObjectChanges(initialTestValue, updatedTestValue), expectedChanges, 'item changes correctly computed')
})

test('bug with multiple artefacts', t => {
  t.plan(1)
  const story = {
    artefacts: [
      { title: 'A-0' },
      { title: 'A-1' }
    ]
  }

  const changes = getObjectChanges(storyInitial, story)
  t.deepEqual(changes, {
    artefacts: {
      add: [{ title: 'A-0' }, { title: 'A-1' }]
    }
  }, 'adds multiple artefacts')
})
