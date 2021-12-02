const test = require('tape')
const { actions } = require('./').default()

test('whakapapa.suggestedChildren', async t => {
  // ////
  // Setup Mock Profiles
  // ////

  // A has no children and partners
  const A = { id: 'A' }
  const B = { id: 'B' }
  const C = { id: 'C' }
  const D = { id: 'D' }
  const E = { id: 'E' }
  const F = { id: 'F' }
  const G = { id: 'G', children: [A, B, C, D, E] }
  const I = { id: 'I', children: [A, B, C, D, E, F] }
  const H = { id: 'H', children: [F], partners: [I] }

  const profiles = { A, B, C, D, E, F, G, H, I }

  // ////
  // Setup Mock Whakapapa
  // ////
  const state = {
    view: {
      ignoredProfiles: ['D']
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
  const suggestedChildren = (input) => {
    return actions.suggestedChildren({ dispatch, state }, input)
  }

  // ////
  //  Tests
  // ////
  t.deepEqual(
    await suggestedChildren(A.id),
    [],
    'returns empty suggestions when there are no partners or children'
  )

  t.deepEqual(
    await suggestedChildren(B.id),
    [],
    'returns empty suggestions when there are children but no partners'
  )

  t.deepEqual(
    await suggestedChildren(H.id),
    [A, B, C, D, E],
    'returns suggested children for partners'
  )

  t.deepEqual(
    await suggestedChildren(G.id),
    [D],
    'returns ignored profile as suggestion'
  )

  t.end()
})

test('whakapapa.suggestedParents', async t => {
  // ////
  // Setup Mock Profiles
  // ////

  // NOTE: A and B are not in the nestedWhakapapa
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
      ignoredProfiles: []
    },
    nestedWhakapapa: C
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
