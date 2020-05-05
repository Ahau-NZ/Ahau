import * as d3 from 'd3'
/*
  These are what makes changes to the state
*/
const mutations = {
  setSelectedPerson (state, node) {
    state.selectedNode = node
    state.selectedPerson = state.selectedNode.data
  },
  setSelectedWhakapapa (state, whakapapa) {
    state.selectedWhakapapa = whakapapa
  },
  updateSelectedWhakapapa (state) {

  },
  addNestedWhakapapa (state, nestedWhakapapa) {
    console.log('addNestedWhakapapa', nestedWhakapapa)
    state.nestedWhakapapa = nestedWhakapapa
    state.flatWhakapapa = state.nestedWhakapapa
      .descendants()
      // .map(d => d.data)
  },
  // addToFlatWhakapapa (state, person) {
  //   state.flatWhakapapa[person.id] = person
  // },
  addToRelationships (state, relationship) {
    state.relationships[relationship.parent + '-' + relationship.child] = relationship
  },
  resetWhakapapa (state) {
    console.log('[MUTATION] resetWhakapapa')
    state.nestedWhakapapa = {}
    state.flatWhakapapa = []
    state.relationships = []
    state.whakapapa = {
      id: '',
      name: 'Loading',
      description: '',
      focus: '',
      // mode: 'descendants',
      recps: null,
      image: { uri: '' },
      ignoredProfiles: []
    }
  },
  updateNode (state, input) {
    console.log('[MUTATION] updateNode')
    state.selectedPerson = {
      ...input,
      children: state.selectedPerson.children,
      parents: state.selectedPerson.parents,
      siblings: state.selectedPerson.siblings,
      partners: state.selectedPerson.partners
    }

    state.selectedNode.data = state.selectedPerson
  },
  updateChildren (state, child) {
    console.log('[MUTATION] updateChildren')
    var newNode = d3.hierarchy(child)

    newNode.depth = state.selectedNode.depth + 1
    newNode.height = state.selectedNode.height - 1
    newNode.parent = state.selectedNode

    if (!state.selectedNode.children) {
      state.selectedNode.children = []
      state.selectedNode.data.children = []
    }

    state.selectedNode.data.children.push(newNode.data)
    state.selectedNode.children.push(newNode)
  },
  // this only works if the parent has no other children...
  updateTopParent (state, parent) {
    console.log('[MUTATION] updateTopParent')
    // add parent to the selected node/person
    console.log('parent', parent)

    // the selected node doesnt know about its new parent...
    state.selectedNode.parent = parent
    state.selectedPerson.parents.push(parent.data)
  },
  updateParents (state, parent) {
    console.log('[MUTATION] updateParents')
    state.selectedNode.data.parents.push(parent)
  },
  addToOtherWhakapapa (state, person) {
    state.otherWhakapapa[person.id] = person
  }
}

export default mutations
