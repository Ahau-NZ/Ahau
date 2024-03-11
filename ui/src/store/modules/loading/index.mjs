import { promisify } from 'util'

import {
  getIndexes
} from './apollo-helpers'

const SECOND = 1000
const DEFAULT_LOADING_TIMEOUT = 2 * SECOND

export default function (apollo) {
  const state = {
    loadingLabel: '', //    String

    /* Loading = querying / importing a lot of data */
    // TODO consider splitting out these cases clearly
    isLoading: false, //    Boolean

    /* Indexing = database has lots of new data, or rebuilding to decrypt existing */
    isIndexing: false, //                  Boolean
    isRebuilding: false, //                Boolean
    indexingSince: null, //                Unix-time
    percentageIndexed: 100, //             Int
    percentageIndexedSinceStartup: 100, // Int

    /* Joining Pataka - currently a fake thing to show action when joining pataka */
    isJoiningPataka: false // Boolean
    // TODO consider replacing with indexing data?
    // NOTE - not a spinner in middle of page, rather thin loading stripes top and bottom of page.
  }

  const getters = {
    loadingLabel: state => {
      if (
        state.isRebuilding ||
        hasBeenIndexingForABit(state.indexingSince)
      ) return 'Syncing...'
      else return state.loadingLabel
    },

    isLoading: state => state.isLoading,
    isIndexing: state => state.isRebuilding || state.isIndexing,

    indexingPercent: state => {
      if (
        state.isRebuilding ||
        hasBeenIndexingForABit(state.indexingSince)
        // we have this so it doesn't pop up which indexing like 2 newly replicated messages!
      ) return state.percentageIndexedSinceStartup
    },

    isJoiningPataka: state => {
      return state.isJoiningPataka
    }
  }

  const mutations = {
    updateLoadingLabel (state, label) {
      state.loadingLabel = label
    },

    updateLoading (state, isLoading) {
      state.isLoading = isLoading
    },

    updateIndexingData (state, { isIndexing, isRebuilding, percentageIndexed, percentageIndexedSinceStartup }) {
      if (!isIndexing && !isRebuilding) state.indexingSince = null
      else if (!state.isIndexingSince) state.indexingSince = Date.now()

      if (typeof isIndexing === 'boolean') state.isIndexing = isIndexing
      if (typeof isRebuilding === 'boolean') state.isRebuilding = isRebuilding
      if (typeof percentageIndexed === 'number') state.percentageIndexed = roundOneDP(percentageIndexed)
      if (typeof percentageIndexedSinceStartup === 'number') {
        state.percentageIndexedSinceStartup = roundOneDP(percentageIndexedSinceStartup)
      }
    },
    updateJoiningPataka (state, isJoiningPataka) {
      state.isJoiningPataka = isJoiningPataka
      setTimeout(() => {
        state.isJoiningPataka = false
      }, 30000)
    }
  }

  const actions = {
    setLoading ({ commit }, loading) {
      if (loading === false) commit('updateLoadingLabel', '')
      commit('updateLoading', loading)
    },
    setLoadingLabel ({ commit }, label) {
      commit('updateLoadingLabel', label)
    },

    setIndexingData ({ commit }, data) {
      commit('updateIndexingData', data)
    },
    setJoiningPataka ({ commit }, isJoiningPataka) {
      commit('updateJoiningPataka', isJoiningPataka)
    },

    startIndexingPoll ({ state, commit, dispatch }, lastCallTimedOut = false) {
      // NOTE when the backend is indexing/ rebuilding on slow devices,
      // sometimes graphql replies don't come quickly
      // If there is a timeout of > 2s we:
      // - cancel this request
      // - manually call "setLoading" so the user sees something is happening
      // - tell the next poll "lastCallTimedOut" so that we can later undo
      //   "setLoading" when data is flowing again

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2000)

      return apollo.query({
        ...getIndexes,
        context: {
          fetchOptions: {
            signal: controller.signal
          }
        }
      })
        .then(res => {
          clearTimeout(timeout)
          if (lastCallTimedOut) dispatch('setLoading', false)

          if (res?.data?.indexes) commit('updateIndexingData', res.data.indexes)
          else throw Error('no indexing data')
        })
        .catch(err => {
          if (err.message.match(/user aborted/i)) {
            dispatch('setLoading', true)
            lastCallTimedOut = true
          } // eslint-disable-line
          else console.log('Error polling indexing status', err)
        })
        .finally(() => {
          const isIndexing = state.isIndexing || lastCallTimedOut
          const delay = isIndexing ? 750 : 4000
          setTimeout(dispatch, delay, 'startIndexingPoll', lastCallTimedOut)
        })
    }
  }

  return {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
  }
}

function roundOneDP (percent) {
  return Math.round(percent * 10) / 10
}

function hasBeenIndexingForABit (indexingSince) {
  return (
    indexingSince &&
    (Date.now() - indexingSince > DEFAULT_LOADING_TIMEOUT)
  )
}
