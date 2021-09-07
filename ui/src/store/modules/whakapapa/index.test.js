const test = require('tape')
const { actions } = require('./').default()

test('whakapapa.suggestedChildren', async t => {
  // ////
  // Setup Mock Profiles
  // ////

  // A has no children and partners
  const A = { id: 'A' } // Damon
  const B = { id: 'B' } // Peach
  const C = { id: 'C' } // Cherese
  const D = { id: 'D' } // Daynah
  const E = { id: 'E' } // Zara
  const F = { id: 'F' } // Zavien
  const G = { id: 'G', children: [A, B, C, D, E] } // Claudine
  const I = { id: 'I', children: [A, B, C, D, E, F] } // Stacey
  const H = { id: 'H', children: [F], partners: [I] } // Susan

  const profiles = { A, B, C, D, E, F, G, H, I }

  // ////
  // Setup Mock Whakapapa
  // ////
  const state = {
    whakapapa: {
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
