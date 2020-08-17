import { GET_CHANGES, EMPTY_STORY, setDefaultStory } from './story-helpers.js'
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
  const emptyStoryChanges = GET_CHANGES(storyInitial, storyInitial)
  t.deepEqual(emptyStoryChanges, {}, 'no changes returns an empty object')
})

test('create new story (properties)', t => {
  t.plan(1)

  const propertyStoryChanges = GET_CHANGES(storyInitial, storyMinimal)

  t.deepEqual(propertyStoryChanges, {
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
  }, 'returns all the changed properties')
})

test('create/update new story (arrays)', t => {
  t.plan(5)

  const arrayStoryChanges = GET_CHANGES(storyInitial, storyComplete)

  var expectedArray = {
    add: [...children]
  }
  t.deepEqual(arrayStoryChanges, {
    mentions: expectedArray,
    contributors: expectedArray,
    creators: expectedArray
  }, 'returns all the changed arrays in format array: { add: [...], remove: [...] }')

  var storyUpdated = clone(storyComplete)

  storyUpdated.mentions.splice(0, 1) // remove first mention
  storyUpdated.mentions.push(parents[0]) // add a profile in

  storyUpdated.contributors.splice(1, 1)

  var updatedStoryChanges = GET_CHANGES(storyComplete, storyUpdated)

  t.deepEqual(updatedStoryChanges.mentions, {
    add: [parents[0]],
    remove: [children[0]]
  }, 'contains mentioned profile to be added and removed')

  t.deepEqual(updatedStoryChanges.contributors, {
    remove: [children[1]]
  }, 'contains contributor profile to be removed')

  // add another three to mentions that are duplicates
  var storyUpdated2 = clone(storyUpdated)
  var parent = parents[1]

  storyUpdated2.mentions.push(parent)
  storyUpdated2.mentions.push(parent)
  storyUpdated2.mentions.push(parent)

  var updatedStory2Changes = GET_CHANGES(storyUpdated, storyUpdated2)

  t.true(updatedStory2Changes.mentions.add.length === 1, 'returns correct amount of mentions, removing duplicates')
  t.deepEqual(updatedStory2Changes.mentions.add[0], parent, 'returns correct mentioned profile')
})
