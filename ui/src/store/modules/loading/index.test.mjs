import test from 'tape'

import Loading from './index.mjs'

const NEW_LOADING_TIMEOUT = 100

test('store/loading - isIndexing', async t => {
  const loading = Loading({})

  loading.state.loadingTimeout = NEW_LOADING_TIMEOUT
  // make the timeout short so we can run tests fast

  t.equal(
    loading.getters.isIndexing(loading.state),
    false,
    'loading false as have not been indexing for more that 2 seconds'
  )

  loading.mutations.updateIndexingData(loading.state, {
    isIndexing: true,
    isRebuilding: false,
    percentageIndexed: 99,
    percentageIndexedSinceStartup: 50
  })

  await new Promise(resolve => setTimeout(resolve, NEW_LOADING_TIMEOUT + 10))

  t.equal(
    loading.getters.isIndexing(loading.state),
    true,
    'loading state appears as have been indexing for > 2 seconds now'
  )

  loading.mutations.updateIndexingData(loading.state, {
    isIndexing: false,
    isRebuilding: false,
    percentageIndexed: 100,
    percentageIndexedSinceStartup: 100
  })

  t.equal(loading.state.indexingSince, null, 'indexingSince zeroed')

  t.equal(
    loading.getters.isIndexing(loading.state),
    false,
    'loading done'
  )

  t.end()
})
