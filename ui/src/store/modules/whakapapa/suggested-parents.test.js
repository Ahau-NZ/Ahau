const test = require('tape')
const { actions } = require('./').default()

test('whakapapa (action: suggestedParents)', async t => {
  // ////
  // Setup Mock Profiles
  // ////

  // NOTE: A and B are not in the nestedDescendants
  const A = { id: 'A', partners: [] }
  const B = { id: 'B', partners: [A] }
  const C = { id: 'C', parents: [A, B], partners: [], siblings: [] }
  const D = { id: 'D', parents: [A], siblings: [C] }

  const profiles = { A, B, C, D }

  // ////
  // Setup Mock Whakapapa
  // ////
  const state = {
    view: {
      focus: 'C',
      ignoredProfiles: []
    }
  }

  // ////
  // Setup Helpers
  // ///
  const dispatchedActions = {
    'person/getPerson' (id) {
      return new Promise((resolve, reject) => {
        resolve(profiles[id])
      })
    }
  }

  const dispatch = (fn, payload, opts) => {
    return dispatchedActions[fn](payload)
  }

  // helper function to reduce duplicate code
  const suggestedParents = (input) => {
    return actions.suggestedParents({ dispatch, state }, input)
  }

  // ////
  //  Tests
  // ////
  t.deepEqual(
    await suggestedParents(A.id),
    [],
    'returns empty suggestions when there are no parents or siblings'
  )

  t.deepEqual(
    await suggestedParents(C.id),
    [A, B],
    'returns the root nodes parents since they arent in the whakapapa yet'
  )

  t.deepEqual(
    await suggestedParents(D.id),
    [B],
    'returns siblings parent as a suggestion'
  )

  t.end()
})
