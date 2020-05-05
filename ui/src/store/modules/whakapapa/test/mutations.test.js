import mutations from '../mutations'

import {
  deeplyNested
} from '../../../../mocks/person-profile'

const defaults = {
  children: [],
  siblings: [],
  parents: [],
  partners: []
}

const test = require('tape')

test('update-person', t => {
  const data = {
    preferredName: 'None',
    legalName: 'None',
    ...defaults
  }

  const state = {
    selectedPerson: data,
    selectedNode: {
      data: data
    }
  }

  const input = {
    preferredName: 'Root',
    legalName: 'Tree Root',
    ...defaults
  }
  const expected = {
    data: {
      ...input
    }
  }

  mutations.updateNode(state, input)

  t.deepEqual(state.selectedNode, expected)

  t.end()
})

test('update-children', t => {

})

// updateChildren (state, child) {
//   var newNode = d3.hierarchy(child)

//   newNode.depth = state.selectedNode.depth + 1
//   newNode.height = state.selectedNode.height - 1
//   newNode.parent = state.selectedNode

//   if (!state.selectedNode.children) {
//     state.selectedNode.children = []
//     state.selectedNode.data.children = []
//   }

//   state.selectedNode.data.children.push(newNode.data)
//   state.selectedNode.children.push(newNode)
// },
