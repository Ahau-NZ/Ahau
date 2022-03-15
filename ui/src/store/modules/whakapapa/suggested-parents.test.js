import { State, Getters } from './lib/test-helpers'

const test = require('tape')
const { actions } = require('./').default()

test('vuex/whakapapa (action: suggestedParents)', async t => {
  // Setup Mock Profiles

  /*
   X----A-----B
      |    |
      D    C

  */

  // NOTE: A and B are not in the nestedDescendants
  const A = { id: 'A', parents: [], partners: [] }
  const B = { id: 'B', parents: [], partners: [A] }
  const X = { id: 'X', parents: [], partners: [A] }
  A.partners.push(B)
  A.partners.push(X)

  const C = { id: 'C', parents: [A, B], partners: [], siblings: [] }
  const D = { id: 'D', parents: [A, X], partners: [], siblings: [C] }
  C.siblings.push(D)

  const profiles = { A, B, C, D }

  // ////
  // Setup Mock Whakapapa
  // ////
  const state = State({
    view: {
      focus: 'C',
      ignoredProfiles: []
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
  const suggestedParents = (input) => {
    return actions.suggestedParents({ getters, dispatch }, input)
  }

  // ////
  //  Tests
  // ////
  t.deepEqual(
    await suggestedParents(A.id),
    [],
    'returns empty suggestions when there are no parents or siblings'
  )

  // <<<<<
  t.deepEqual(
    await suggestedParents(C.id),
    [X],
    'returns the root nodes parents since they arent in the whakapapa yet'
  )

  t.deepEqual(
    await suggestedParents(D.id),
    [B],
    'returns siblings parent as a suggestion'
  )

  t.end()
})
