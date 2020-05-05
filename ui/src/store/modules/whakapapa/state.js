/*
  holds current value of the artefact state
*/
const state = {
  // loaded: false,
  selectedPerson: null,
  selectedNode: null,
  nestedWhakapapa: {},
  flatWhakapapa: [],
  otherWhakapapa: [],
  relationships: [],
  selectedWhakapapa: {
    id: '',
    name: 'Loading',
    description: '',
    focus: '',
    // mode: 'descendants',
    recps: null,
    image: { uri: '' },
    ignoredProfiles: []
  }
}

export default state
