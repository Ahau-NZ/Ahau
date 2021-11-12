import uniqby from 'lodash.uniqby'
import isEmpty from 'lodash.isempty'
import clone from 'lodash.clonedeep'
import Vue from 'vue'

import { getWhakapapaView, getWhakapapaViews, saveWhakapapaView } from './apollo-helpers'
import tree from '../../../lib/tree-helpers'
import settings from '../../../lib/link'

const LINK_OFFSET = 10

export default function (apollo) {
  const loadingView = {
    name: 'Loading',
    description: '',
    focus: '',
    recps: null,
    image: { uri: '' },
    ignoredProfiles: [],
    importantRelationships: [],
    recordCount: 0
  }
  const state = {
    // loading, // TODO
    view: loadingView,
    lastView: loadingView,
    nestedWhakapapa: {},
    whakapapa: {},
    nodes: {
      // [profileId]: [node, node, ... ]  NOTE multiple nodes for each profileId as there might be duplicates
    }
  }

  const getters = {
    whakapapaView: state => state.view,
    lastWhakapapaView: state => state.lastView,
    // whakapapaView: state => state.loading ? loadingView : state.view, // TODO
    nestedWhakapapa: state => state.nestedWhakapapa,
    nodes: state => {
      return state.nodes
    },
    // getNode: state => (id) => {
    //   return state.nodes[id]
    // },
    lessImportantLinks: state => {
      const links = calculateLessImportantLinks(state)
      return links || []
    }
  }

  const mutations = {
    setView (state, view) {
      state.lastView = state.view
      state.view = view
    },
    addNode (state, node) {
      if (!node || !node.data || !node.data.id) return

      const nodeId = node.data.id
      const change = [...(state.nodes[nodeId] || []), node]

      Vue.set(state.nodes, nodeId, change)
    },
    setLessImportantLinks (state, links) {
      state.lessImportantLinks = links
    },
    resetWhakapapaView (state) {
      state.lastView = state.view
      state.view = loadingView
      state.nestedWhakapapa = {}
      state.nodes = []
      state.lessImportantLinks = []
    },
    setNestedWhakapapa (state, nestedWhakapapa) {
      state.nestedWhakapapa = nestedWhakapapa
    },
    updateNodeInNestedWhakapapa (state, node) {
      state.nestedWhakapapa = tree.updateNode(state.nestedWhakapapa, node)
    },
    deleteNodeInNestedWhakapapa (state, node) {
      var whakapapa = {}

      if (node.isPartner) {
        whakapapa = tree.deletePartnerNode(state.nestedWhakapapa, node.id)
      } else {
        whakapapa = tree.deleteNode(state.nestedWhakapapa, node.id)
      }

      state.nestedWhakapapa = whakapapa
    }
  }

  function hasCollapsedParent (node) {
    let searchNode = node
    let isCollapsed = false
    // search ascendants to see if any are collapsed
    while (searchNode && !isCollapsed) {
      searchNode = searchNode.parent
      isCollapsed = searchNode && searchNode.data.isCollapsed
    }

    return isCollapsed
  }

  function calculateLessImportantLinks (state) {
    // TODO - call this when loading graph is done?
    if (!Object.keys(state.nodes).length || isEmpty(state.view.importantRelationships)) return

    const links = []
    // // for each importantRelationship find the x,y coords on the graph and create set the link
    state.view.importantRelationships.forEach(rule => {
      const nodes = state.nodes[rule.profileId]
      if (!nodes || nodes.length === 0) return

      const node = clone(nodes[nodes.length - 1])
      if (hasCollapsedParent(node)) return

      // TODO WARNING - handle there being multiple locations for a node

      // skip the 0th relationship as that was "most important" and already drawn
      rule.other.forEach(({ profileId, relationshipType }) => {
        const targetNodes = state.nodes[profileId]

        if (!targetNodes || targetNodes.length === 0) return

        const targetNode = clone(targetNodes[targetNodes.length - 1])
        if (hasCollapsedParent(targetNode)) return

        const isDashed = relationshipType && relationshipType !== 'birth' && relationshipType !== 'partner'

        const coords = {
          startX: targetNode.x + targetNode.radius,
          startY: targetNode.y + targetNode.radius,
          endX: node.x + node.radius,
          endY: node.y + node.radius
        }

        if (relationshipType === 'partner') {
          coords.directed = false
        }

        const offset = (coords.startX < coords.endX) ? LINK_OFFSET : -1 * LINK_OFFSET
        coords.startX += offset
        coords.endX -= offset

        links.push({
          id: [node.data.id, targetNode.data.id].join('--'),
          style: {
            fill: 'none',
            // stroke: settings.color.getColor(0),
            stroke: '#f0f',
            opacity: settings.opacity,
            strokeWidth: settings.thickness,
            strokeLinejoin: 'round',
            strokeDasharray: isDashed ? 2.5 : 0
          },
          d: settings.path(coords)
        })
      })
    })

    if (links.length) return links
  }

  const actions = {
    updateNodeInNestedWhakapapa ({ commit, dispatch }, node) {
      commit('updateNodeInNestedWhakapapa', node)
    },
    deleteNodeInNestedWhakapapa ({ commit, dispatch }, node) {
      commit('deleteNodeInNestedWhakapapa', node)
    },
    async getWhakapapaView (context, viewId) {
      try {
        const res = await apollo.query(getWhakapapaView(viewId))

        if (res.errors) throw new Error(res.errors)

        // TODO success alert message
        return res.data.whakapapaView
      } catch (err) {
        // TODO error alert message
        console.error('failed to get the whakapapa', err)
      }
    },
    async getWhakapapaViews (context, opts = {}) {
      const { groupId } = opts
      try {
        const res = await apollo.query(getWhakapapaViews(groupId))
        if (res.errors) throw new Error(res.errors)

        // TODO success alert message
        return res.data.whakapapaViews
      } catch (err) {
        // TODO error alert message
        return []
      }
    },
    async loadWhakapapaView ({ dispatch, commit }, id) {
      commit('resetWhakapapaView')
      const view = await dispatch('getWhakapapaView', id)
      if (view) commit('setView', view)
    },
    async saveWhakapapaView ({ dispatch, commit }, input) {
      try {
        const res = await apollo.mutate(
          saveWhakapapaView(input)
        )

        if (res.errors) throw new Error(res.errors)

        const view = await dispatch('getWhakapapaView', res.data.saveWhakapapaView)
        if (view) commit('setView', view)

        return res.data.saveWhakapapaView
      } catch (err) {
        console.error('failed to save the whakapapa', err)
      }
    },
    resetWhakapapaView ({ commit }) {
      commit('resetWhakapapaView')
    },
    addNode ({ commit }, node) {
      commit('addNode', node)
    },
    setNestedWhakapapa ({ commit, dispatch }, nestedWhakapapa) {
      commit('setNestedWhakapapa', nestedWhakapapa)
    },
    async suggestedChildren ({ dispatch, state }, parentId) {
      // get the persons full profile
      const person = await dispatch('person/getPerson', parentId, { root: true })

      if (!person || !person.children || !person.children.length) return []

      // get current children who are ignored
      const ignoredChildren = person.children.filter(A => state.view.ignoredProfiles.includes(A.id))

      return uniqby(
        [
          ...flattenToNestedArray(person, 'partners', 'children'), // get all children of partners
          ...ignoredChildren // get all children who have been ignored from this whakapapa
        ],
        'id'
      )
    },
    async suggestedParents ({ dispatch, state }, childId) {
      const person = await dispatch('person/getPerson', childId, { root: true })
      const isRootNode = state.nestedWhakapapa.id === person.id

      if (!person || !person.parents || !person.parents.length) return []

      const ignoredParents = person.parents.filter(A => state.view.ignoredProfiles.includes(A.id))

      return uniqby(
        [
          ...flattenToNestedArray(person, 'siblings', 'parents'), // get all parents of siblings
          ...flattenToNestedArray(person, 'parents', 'partners'), // get all partners of parents
          ...ignoredParents,
          ...(isRootNode ? person.parents : []) // handle existing parents if this is the root node
        ],
        'id'
      )
    }
  }

  return {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
  }
}

/**
 * A helper function to flatten nested arrays within an array of objects.
 * E.g. to get a persons siblings parents use flattenToNestedArray(person, 'siblings', 'parents')

 * @param {object} obj an object which holds the array
 * @param {string} array which field to look at on the given obj
 * @param {string} nestedArray which field to map objects in obj.array to
 */
function flattenToNestedArray (obj, array, nestedArray) {
  if (!obj[array] || !obj[array].length) return []

  return obj[array]
    .map(m => m[nestedArray])
    .flat() // flattens from [[A, B], [C]] to [A, B, C]
    .filter(A => !obj[nestedArray].some(B => B.id === A.id))
}
