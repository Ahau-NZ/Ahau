import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'

export default {
  state,
  getters,
  mutations,
  actions,
  namespaced: true
}

/*
  USAGE

  Using getters and actions:
    Import the following
    `import { mapActions, mapGetters } from 'vuex'`

    In the components computed property
    `computed: {
      ...mapGetters('artefact', ['artefacts']) // FORMAT: ('<module-name>', ['<getter-1-name>', '<getter-2-name>', ...])
    }`
    In the components methods property
    `methods: {
      ...mapActions('artefact', ['getArtefacts']) // FORMAT: ('<module-name>', ['<action-1-name>', '<action-2-name>', ...])
    }`
*/
