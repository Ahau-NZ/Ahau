import { GET_CHANGES } from './story-helpers.js'

import clone from 'lodash.clonedeep'
const test = require('tape')

const FULL_STORY = {
  title: 'Whanau Reunion',
  description: 'Whanau Reunion 2020 where we had a whanau olympics',
  startDate: '2020-07-01',
  endDate: '2020-07-01',
  location: '123 Pukemoremore Road',
  locationDescription: 'The Farm',
  creator: {
    id: '%ProfileA'
  },
  contributionNotes: 'Any Whanau can add or contribute to this story',
  format: null,
  identifier: null,
  source: null,
  language: null,
  translation: null,
  culturalNarrative: null,
  mentions: [
    { id: '%ProfileA' }, { id: '%ProfileB' }, { id: '%ProfileC' }
  ],
  categories: [],
  collections: [],
  access: [],
  contributors: [
    { id: '%ProfileA' }, { id: '%ProfileC' }
  ],
  protocols: [],
  relatedRecords: [],
  artefacts: [
    { id: '%A', title: 'Artefact A' }, { id: '%B', title: 'Artefact B' }
  ]
}

test('edit story submission', t => {
  t.plan(3)

  var original = clone(FULL_STORY)

  // TEST ON NO CHANGES
  var noChangesSubmission = GET_CHANGES(original, original)
  t.deepEqual(noChangesSubmission, {}, 'empty edit submission returns empty object')

  // TEST ON CHANGES IN STRINGS
  var stringChanges = clone(FULL_STORY)

  var expectedStringChanges = {
    title: 'Whanau Reunion of 2020',
    description: 'We had a whanau reunion at the farm in 2020'
  }

  stringChanges.title = expectedStringChanges.title
  stringChanges.description = expectedStringChanges.description

  var stringChangesSubmission = GET_CHANGES(original, stringChanges)
  t.deepEqual(stringChangesSubmission, expectedStringChanges, 'string changes in an edit story submission return expected changes')

  // TEST ON CHANGES IN AN ARRAY
  var arrayChanges = clone(FULL_STORY)

  arrayChanges.artefacts.push({ title: 'Artefact C', mentions: [{ id: '%1' }] })
  arrayChanges.artefacts[0].title = 'ARTEFACT A'
  arrayChanges.artefacts.splice(1, 1)

  var expectedArraySubmission = {
    artefacts: {
      add: [
        { id: '%A', title: 'ARTEFACT A', linkId: undefined },
        { title: 'Artefact C', mentions: [{ id: '%1' }] }
      ],
      remove: [
        { id: '%B', title: 'Artefact B' }
      ]
    }
  }

  var arrayChangesSubmission = GET_CHANGES(original, arrayChanges)
  t.deepEqual(arrayChangesSubmission, expectedArraySubmission, 'submissions which have arrays returns correctly, inc nested arrays')
})
