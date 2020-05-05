import * as d3 from 'd3'
import { createProvider } from '@/plugins/vue-apollo'
import { saveWhakapapa, whakapapaView } from './graphql'

/*
  this is needed in order to run queries and mutations
  TODO: is this okay?
*/
const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

/*
  These do not like directly change the state, but they commit mutations (changes),
  which make changes to the state
*/
const actions = {
  // update the children of a given node
  async updateChildren ({ state, commit, dispatch }, { parent, child }) {
    console.log('updateChildren')
    const childProfile = await dispatch('loadDescendants', child)

    commit('updateChildren', childProfile)

    commit('addNestedWhakapapa', state.nestedWhakapapa)

    // update the selected person to this node
    dispatch('setSelectedPerson', state.selectedPerson.id)
  },
  updateNode ({ state, commit, dispatch }, node) {
    // update node in nested whakapapa
    commit('updateNode', node)

    // update the tree
    commit('addNestedWhakapapa', state.nestedWhakapapa)

    // update the selected person to this node
    dispatch('setSelectedPerson', node.id)
  },
  /*
    loads the descendants of a new parent node, then updates the
    hierarchy so this node is at the top
  */
  async updateTopParent ({ state, commit, dispatch }, parent) {
    // TODO: change to do some error handling
    if (!parent) return

    const parentProfile = await dispatch('loadDescendants', parent)
    const hierarchy = d3.hierarchy(parentProfile)

    // update the selectedPersons parent
    commit('updateTopParent', hierarchy)

    // update the tree with the new hierarchy
    commit('addNestedWhakapapa', hierarchy)

    // update the selectedPerson to this parent
    dispatch('setSelectedPerson', parentProfile.id)
  },
  async updateParents ({ commit, dispatch, state }, parent) {
    console.log('updateParents')
    const parentProfile = await dispatch('loadDescendants', parent)

    commit('updateParents', parentProfile)
    commit('addNestedWhakapapa', state.nestedWhakapapa)
  },
  /*
    calls a db query to save a whakapapa
  */
  async saveWhakapapa ({ dispatch }, input) {
    console.log('saveWhakapapa')
    const res = await apolloClient.mutate(saveWhakapapa(input))
    if (res.data) {
      const whakapapa = dispatch('getWhakapapa', res.data.saveWhakapapaView)
      return whakapapa
    }
    return null
  },
  /*
    gets a whakapapa from the database by Id
  */
  async getWhakapapa ({ commit }, id) {
    const res = await apolloClient.query(whakapapaView(id))
    if (res.data) {
      await commit('setSelectedWhakapapa', res.data.whakapapaView)
      return res.data.whakapapaView
    }

    // error  handling here

    return null
  },
  /*
    loads the full whakapapa (all descendants) underneath a given id.
    Typically should be given the focus of a whakapapa. It also stores
    information about this whakapapa including:
    - flatWhakapapa: flat version of the whakapapa where you can get a persons info using flatWhakapapa[id]
    - nestedWhakapapa: a nested tree used to build the tree + table
    - whakapapa: details about this whakapapa
  */

  async loadFullWhakapapa ({ commit, dispatch }, id) {
    console.log('loadFullWhakapapa')
    commit('setLoading', true, { root: true })

    if (!id) return

    // reset the state
    await commit('resetWhakapapa')

    // get the whakapapa from the db by the given id
    const whakapapa = await dispatch('getWhakapapa', id)
    if (!whakapapa) return

    // generate the nestedWhakapapa starting at the focus
    const nestedWhakapapa = await dispatch('loadDescendants', whakapapa.focus)
    await commit('addNestedWhakapapa', d3.hierarchy(nestedWhakapapa))

    commit('setLoading', false, { root: true })
  },
  async loadDescendants ({ state, commit, dispatch }, id) {
    console.log('loadDescendants')
    // calls person.fetchPerson which gets info about this person from the db
    const person = await dispatch('person/fetchPerson', id, { root: true })
    // error handling here
    if (!person) return

    person.partners = []
    person.siblings = []
    var partners = []

    // filter out ignored profiles
    person.children = person.children.filter(d => isVisiblePerson(state.whakapapa, d))
    person.parents = person.parents.filter(d => isVisiblePerson(state.whakapapa, d))

    // load descendants of each child of this person
    person.children = await Promise.all(person.children.map(async child => {
      // check if we already know this child
      var profile = state.flatWhakapapa.find(d => d.data.id === child.profile.id)

      // use that instead
      if (profile) {
        profile = profile.data
      } else {
        profile = await dispatch('loadDescendants', child.profile.id)
      }

      // get info about the relationship
      var info = {
        relationshipId: child.relationshipId,
        relationshipType: child.relationshipType,
        parent: person.id,
        child: child.profile.id
      }

      // set the relationship type for this child TODO: better way of storing relationshipType
      profile.relationshipType = child.relationshipType

      profile.parents.forEach(parent => {
        if (parent.id === person.id) return // dont to store that
        if (partners[parent.id]) return

        person.partners.push(parent)
        partners[parent.id] = true
        commit('addToOtherWhakapapa', parent)
      })

      // add the relationship of this person and child to relationships
      await commit('addToRelationships', info)

      // map the child to the profile
      return profile
    }))

    person.parents = await Promise.all(person.parents.map(async parent => {
      // check if we already know this parent
      var profile = state.flatWhakapapa.find(d => d.data.id === parent.profile.id)
      // use that instead
      if (profile) {
        profile = profile.data
      } else {
        // otherwise load their profile
        profile = await dispatch('person/fetchPerson', parent.profile.id, { root: true })
      }

      // get info about the relationship
      var info = {
        relationshipId: parent.relationshipId,
        relationshipType: parent.relationshipType,
        child: person.id,
        parent: parent.profile.id
      }

      // set the relationship type for this child TODO: better way of storing relationshipType
      profile.relationshipType = parent.relationshipType

      // add the relationship of this person and child to relationships
      await commit('addToRelationships', info)
      return profile
    }))

    if (!person.children) person.children = []
    if (!person.parents) person.parents = []
    if (!person.partners) person.partners = []

    person.siblings = []

    return person
  },
  async updateFocus ({ rootState, dispatch }, parent) {
    const input = {
      id: rootState.whakapapa.selectedWhakapapa.id,
      focus: parent
    }
    // call action to save whakapapa in the db
    const whakapapa = await dispatch('saveWhakapapa', input)

    if (whakapapa) {
      // update the tree by adding the parent to the top
      await dispatch('updateTopParent', parent)
    }
  },
  async changeFocus ({ commit, dispatch }, id) {
    // const newFocus = await dispatch('getWhakapapaHead', id, 'newAmountParents')
    // await commit('setFocus', newFocus)
  },
  /*
    TODO: how can we load less?
  */
  async getWhakapapaHead ({ dispatch, state }, id, type = 'temp') {
    /*

    */
    // const person = await dispatch('person/fetchPerson', id, { root: true })
    // if (!person || !person.parents || person.parents.length < 1) return id
    // // this.partnerFocus[type] = this.partnerFocus[type] + 1
    // for await (const parent of person.parents) {
    //   const profile = state.flatWhakapapa.find(d => d.data.id === parent.profile.id)
    //   // follow parent from the main branch
    //   if (profile && profile.parents) {
    //     return this.getWhakapapaHead(parent.profile.id, type)
    //   }
    // }
    // return this.getWhakapapaHead(person.parents[0].profile.id, type)
  },
  async setSelectedPerson ({ state, commit, dispatch }, id) {
    console.log('[ACTION] setSelectedPerson')
    var node = state.flatWhakapapa.find(d => d.data.id === id)

    if (node) {
      console.log('found', node)
      commit('setSelectedPerson', node)
    } else {
      console.log('wasnt found...')
      if (state.otherWhakapapa[id]) {
        // get the full whakapapa?
        const person = await dispatch('loadDescendants', id)

        // change the value of this other whakapapa
        const hierarchy = d3.hierarchy(person)

        // set the selected person
        commit('setSelectedPerson', hierarchy)
      }
    }
  }
}

export default actions

function isVisiblePerson (whakapapa, descendant) {
  return whakapapa.ignoredProfiles.indexOf(descendant.profile.id) === -1
}
