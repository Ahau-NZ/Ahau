import uniqby from 'lodash.uniqby'
import isEmpty from 'lodash.isempty'
import tree from '../../../lib/tree-helpers'
import { getWhakapapaView } from './apollo-helpers'

const settings = require('../../../lib/link')

export default function (apollo) {
  const loadingView = {
    name: 'Loading',
    description: '',
    focus: '',
    recps: null,
    image: { uri: '' },
    ignoredProfiles: [],
    importantRelationships: []
  }
  const state = {
    // loading, // TODO
    view: loadingView,
    nestedWhakapapa: {},
    whakapapa: {},
    nodes: {}
  }

  const getters = {
    whakapapaView: state => state.view,
    // whakapapaView: state => state.loading ? loadingView : state.view, // TODO
    nestedWhakapapa: state => state.nestedWhakapapa,
    whakapapa: state => {
      throw new Error('WHO IS USING THIS')
      // return state.whakapapa
    },
    // getNode: state => (id) => {
    //   return state.nodes[id]
    // },
    lessImportantLinks: state => {
      if (isEmpty(state.nodes) || isEmpty(state.view.importantRelationships)) return []

      const links = []
      // for each importantRelationship find the x,y coords on the graph and create set the link
      state.view.importantRelationships.forEach(rule => {
        const nodes = state.nodes[rule.profileId]
        if (!nodes || nodes.length === 0) return

        const node = nodes[0]
        // TODO WARNING - handle there being multiple locations for a node

        // skip the 0th relationship as that was "most important" and already drawn
        rule.important.slice(1).forEach(profileId => {
          const targetNodes = state.nodes[profileId]
          if (!targetNodes || targetNodes.length === 0) return
          const targetNode = targetNodes[0]
          // TODO assuming first targetNode is right one
          const isDashed = targetNode.data.relationshipType !== 'birth'

          const branch = ((targetNode.y + targetNode.radius) - (node.y + node.radius)) / 2

          links.push({
            id: node.data.id + ' - ' + targetNode.data.id,
            style: {
              fill: 'none',
              stroke: settings.color.getColor(0),
              opacity: settings.opacity,
              strokeWidth: settings.thickness,
              strokeLinejoin: 'round',
              strokeDasharray: isDashed ? 2.5 : 0
            },
            d: settings.path(
              {
                startX: node.x + node.radius,
                startY: node.y + node.radius,
                endX: targetNode.x + targetNode.radius,
                endY: targetNode.y + targetNode.radius
              },
              branch
            )
          })
        })
      })
      return links
    }
  }

  const mutations = {
    setView (state, view) {
      state.view = view
    },
    addNode (state, node) {
      if (!node) return
      const id = node.id || (node.data && node.data.id)
      if (!id) return

      state.nodes[id] = [
        ...(state.nodes[id] || []),
        node
      ]
    },
    resetNodes (state) {
      state.nodes = []
    },
    setNestedWhakapapa (state, nestedWhakapapa) {
      state.nestedWhakapapa = nestedWhakapapa
    },
    setWhakapapa (state, whakapapa) {
      state.whakapapa = whakapapa
    },
    updatePartnerInNestedWhakapapa (state, node) {
      state.nestedWhakapapa = tree.updatePartner(state.nestedWhakapapa, node)
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
    },
    addChildToNestedWhakapapa (state, { child, parent }) {
      var whakapapa = {}

      if (parent.isPartner) {
        whakapapa = tree.addChildToPartner(state.nestedWhakapapa, child, parent)
      } else {
        whakapapa = tree.addChild(state.nestedWhakapapa, child, parent)
      }

      state.nestedWhakapapa = whakapapa
    },
    addParentToNestedWhakapapa (state, { child, parent }) {
      state.nestedWhakapapa = tree.addParent(state.nestedWhakapapa, child, parent)
    },
    addPartnerToNestedWhakapapa (state, { node, partner }) {
      state.nestedWhakapapa = tree.addPartner(state.nestedWhakapapa, node, partner)
    }
  }

  const actions = {
    async getWhakapapaView (context, id) {
      try {
        const res = await apollo.query(
          getWhakapapaView(id)
        )

        if (res.errors) throw new Error(res.errors)

        // TODO success alert message
        return res.data.whakapapaView
      } catch (err) {
        // TODO error alert message
        console.error(err)
      }
    },
    async loadWhakapapaView ({ dispatch, commit, state }, id) {
      if (id !== state.view.id) commit('setView', loadingView)

      const view = await dispatch('getWhakapapaView', id)
      if (view) commit('setView', view)
    },
    addNode ({ commit }, node) {
      commit('addNode', node)
    },
    setNestedWhakapapa ({ commit }, nestedWhakapapa) {
      commit('resetNodes')
      commit('setNestedWhakapapa', nestedWhakapapa)
    },
    async suggestedChildren ({ dispatch, state }, parentId) {
      // get the persons full profile
      const person = await dispatch('person/getPerson', parentId, { root: true })

      if (!person || !person.children || !person.children.length) return []

      // get current children who are ignored
      const ignoredChildren = person.children.filter(A => state.whakapapa.ignoredProfiles.includes(A.id))

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

      const ignoredParents = person.parents.filter(A => state.whakapapa.ignoredProfiles.includes(A.id))

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
