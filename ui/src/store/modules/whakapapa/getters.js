/*
  these map getters to whats in the state, then we can use those getters
  within components
*/
const getters = {
  // loaded: state => {
  //   return state.loaded
  // },
  selectedPerson: state => {
    return state.selectedPerson
  },
  selectedWhakapapa: state => {
    return state.selectedWhakapapa
  },
  nestedWhakapapa: state => {
    return state.nestedWhakapapa
  },
  flatWhakapapa: state => {
    return state.flatWhakapapa
  },
  relationships: state => {
    return state.relationships
  }
}

export default getters
