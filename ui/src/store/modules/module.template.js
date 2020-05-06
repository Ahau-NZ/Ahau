// import gql from 'graphql-tag'
// import { createProvider } from '@/plugins/vue-apollo'

/*
  this is needed in order to run queries and mutations
  TODO: is this okay?
*/
// const apolloProvider = createProvider()
// const apolloClient = apolloProvider.defaultClient

/*
  holds current value of the artefact state
*/
const state = {
}

/*
  these map getters to whats in the state, then we can use those getters
  within components
*/
const getters = {
}

/*
  These are what makes changes to the state
*/
const mutations = {
}

/*
  These do not like directly change the state, but they commit mutations (changes),
  which make changes to the state
*/
const actions = {
}

export default {
  state,
  mutations,
  actions,
  getters,
  namespaced: true
}

/*
  USAGE

  Using getters and actions:
    Import the following
    `import { mapActions, mapGetters } from 'vuex'`

    In the components computed property
    `computed: {
      ...mapGetters('moduleName', ['moduleGetter']) // FORMAT: ('<module-name>', ['<getter-1-name>', '<getter-2-name>', ...])
    }`
    In the components methods property
    `methods: {
      ...mapActions('moduleName', ['moduleAction']) // FORMAT: ('<module-name>', ['<action-1-name>', '<action-2-name>', ...])
    }`
*/
