import { artefactChanges } from './artefact-helpers.js'
const test = require('tape')

test('artefactChanges', t => {
  t.plan(1)
  const initial = {
    title: 'A',
    description: 'A description',
    format: null,
    mentions: []
  }

  const updated = {
    title: 'B',
    mentions: [{ id: '%person1' }],
    format: null
  }

  var expected = {
    title: 'B',
    mentions: { add: ['%person1'] }
  }

  var actual = artefactChanges(initial, updated)

  t.deepEqual(actual, expected, 'changes are pulled from the object')
})
