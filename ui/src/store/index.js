import Vue from 'vue'
import Vuex from 'vuex'
import debounce from 'lodash.debounce'

// /* global namespace */
import root from './root' // probably has modules to split out
import archive from './modules/archive'
import dialog from './modules/dialog'
import notifications from './modules/notifications'

// /* namespaced */
import tree from './modules/tree'
import whakapapa from './modules/whakapapa'

import alerts from './modules/alerts'
import analytics from './modules/analytics'
import error from './modules/error'

// new
import tribe from './modules/tribe'
import subtribe from './modules/subtribe'
import profile from './modules/profile'
import community from './modules/community'
import person from './modules/person'
import collection from './modules/collection/'
import settings from './modules/settings/'
import story from './modules/story/'
import table from './modules/table'

import { apolloProvider } from '../plugins/vue-apollo'

const apollo = apolloProvider.defaultClient

apollo.niceQuery = runApollo('query')
apollo.niceMutation = runApollo('mutate')
// helpers which close over apollo.query/mutate and handle errors, results
// WARNING assumes one thing is being queried at a time
function runApollo (method) {
  const result = (dispatch, opts) => apollo[method](opts)
    .then(res => {
      if (res.errors) {
        dispatch('error/setGraphqlError', res.errors, { root: true })
        return null
      } // eslint-disable-line
      else return res.data[Object.keys(res.data)[0]] // assumption of only one thing queried
    })
    .catch(error => {
      if (error.networkError && error.networkError.result && error.networkError.result.errors) {
        error = error.networkError.result.errors
      }

      dispatch('error/setNetworkError', error, { root: true })
    })

  return result
}

Vue.use(Vuex)

/*
  TODO (later):
    - [ ] assess which bits of these should be namespaced
    - [ ] root: move loading and syncing to alerts modules
    - [ ] change modules to be namespaced
          - https://vuex.vuejs.org/guide/modules.html#namespacing
          - see alerts module for another example
*/

export default new Vuex.Store({
  ...root(apollo),
  modules: {
    archive,
    dialog,
    notifications,
    alerts,
    analytics,
    error,
    tree: tree(),

    // new
    tribe: tribe(apollo),
    subtribe: subtribe(apollo),
    profile: profile(apollo),
    community: community(apollo),
    person: person(apollo),
    collection: collection(apollo),
    story: story(apollo),

    whakapapa: whakapapa(apollo),

    table: table(apollo),

    settings: settings(apollo)
  },
  plugins: [
    updateTree
  ]
})

function updateTree (store) {
  // this plugin listens for changes to whakapapa/nestedDescendants
  // triggers graph data updates
  const slowedRefreshTree = debounce(
    () => {
      store.getters['whakapapa/whakapapaView'].tree
        ? store.dispatch('tree/refreshWhakapapaData')
        : store.dispatch('table/refreshWhakapapaData')
    },
    200,
    { maxWait: 2000 }
  )
  // we debounce this refresh to slow the degree to which d3 calculations and graph redraw are done

  store.subscribe(mutation => {
    if (
      mutation.type.startsWith('whakapapa') ||
      mutation.type === 'person/setPerson' // includes birthOrder info
    ) slowedRefreshTree()
  })
}
