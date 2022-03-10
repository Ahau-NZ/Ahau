import { State } from './lib/test-helpers'

const test = require('tape')
const { mutations } = require('./').default()

test('vuex/whakapapa mutations.removeLinksToProfile (child)', t => {
  // SIMPLE
  /*
      A
      |
      B
  */
  let state = State({
    childLinks: {
      A: {
        B: 'birth'
      },
      B: {}
    }
  })

  let link = { parent: 'A', child: 'B' }

  mutations.removeLinkBetweenProfiles(state, link)

  t.deepEqual(
    state.childLinks,
    {
      A: {},
      B: {}
    },
    'removes child from A'
  )

  // ADVANCED 1 (removing a shared child from a main node but not the partner)
  /*
          A---C
            |
            B
  */
  state = State({
    childLinks: {
      A: {
        B: 'birth'
      },
      B: {},
      C: {
        B: 'birth'
      }
    },
    partnerLinks: {
      A: {
        B: 'partners'
      }
    }
  })

  mutations.removeLinkBetweenProfiles(state, link)

  t.deepEqual(
    state.childLinks,
    {
      A: {},
      B: {},
      C: {
        B: 'birth' // still here because it was only removed from A
      }
    },
    'removes child only from A'
  )

  // ADVANCED 2 (removing a shared child from a partner node but not the main node)

  // reset the state
  state = State({
    childLinks: {
      A: {
        B: 'birth'
      },
      B: {},
      C: {
        B: 'birth'
      }
    },
    partnerLinks: {
      A: {
        B: 'partners'
      }
    }
  })

  link = { parent: 'C', child: 'B' }
  mutations.removeLinkBetweenProfiles(state, link)

  t.deepEqual(
    state.childLinks,
    {
      A: {
        B: 'birth' // still here because it was only removed from C
      },
      B: {},
      C: {}
    },
    'removes child only from C'
  )

  t.end()
})

test.only('vuex/whakapapa mutations.removeLinksToProfile (partner)', t => {
  // SIMPLE
  const state = State({
    childLinks: {
      A: {},
      B: {}
    },
    partnerLinks: {
      A: {
        B: 'partners'
      }
    }
  })

  const link = { parent: 'A', child: 'B' }

  mutations.removeLinkBetweenProfiles(state, link)

  t.deepEqual(
    state.partnerLinks,
    {
      A: {}
    },
    'removes partner from A'
  )

  t.end()
})
