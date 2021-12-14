import Vue from 'vue'
import Vuex from 'vuex'

// /* global namespace */
import root from './root' // probably has modules to split out
import archive from './modules/archive'
import dialog from './modules/dialog'
import notifications from './modules/notifications'

// /* namespaced */
import tree from './modules/tree'
import whakapapa from './modules/whakapapa'
import person from './modules/person'

import alerts from './modules/alerts'
import analytics from './modules/analytics'

// new
import tribe from './modules/tribe'
import subtribe from './modules/subtribe'
import community from './modules/community'
import collection from './modules/collection/'
import settings from './modules/settings/'
import story from './modules/story/'
import table from './modules/table'

import { apolloProvider } from '../plugins/vue-apollo'

const apollo = apolloProvider.defaultClient

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
    tree: tree(),

    // new
    tribe: tribe(apollo),
    subtribe: subtribe(apollo),
    community: community(apollo),
    collection: collection(apollo),
    story: story(apollo),

    person: person(apollo),
    whakapapa: whakapapa(apollo),

    table: table(apollo),

    settings: settings(apollo)
  }
})
