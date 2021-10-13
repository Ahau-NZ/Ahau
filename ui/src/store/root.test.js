import Root from './root.js'

const test = require('tape')
const SECOND = 1000

test('store/root - loadingState', async t => {
  const root = Root({})

  root.mutations.updateIndexingData(root.state, {
    isIndexing: true,
    isRebuilding: false,
    percentageIndexed: 99,
    percentageIndexedSinceStartup: 50
  })

  t.equal(
    root.getters.loadingState(root.state),
    false,
    'loading false as have not been indexing for more that 2 seconds'
  )

  await new Promise(resolve => setTimeout(resolve, 2.5 * SECOND))

  t.equal(
    root.getters.loadingState(root.state),
    50,
    'loading state appears as have been indexing for > 2 seconds now'
  )

  root.mutations.updateIndexingData(root.state, {
    isIndexing: false,
    isRebuilding: false,
    percentageIndexed: 100,
    percentageIndexedSinceStartup: 100
  })

  t.equal(root.state.indexingSince, null, 'indexingSince zeroed')

  t.equal(
    root.getters.loadingState(root.state),
    false,
    'loading done'
  )

  t.end()
})
