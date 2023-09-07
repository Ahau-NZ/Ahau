import test from 'tape'

import { State, Getters } from './lib/test-helpers.mjs'
import src from './index.mjs'

const { actions } = src()

test('vuex/whakapapa (action: suggestedChildren)', async t => {
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
  const state = State({
    view: {
      ignoredProfiles: ['D']
    }
  })
  const getters = Getters(state)

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
    return actions.suggestedChildren({ getters, dispatch }, input)
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
