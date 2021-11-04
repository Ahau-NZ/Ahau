import uniqby from 'lodash.uniqby'
import isEmpty from 'lodash.isempty'
import tree from '../../../lib/tree-helpers'
import settings from '../../../lib/link'
import { getWhakapapaView } from './apollo-helpers'

const LINK_OFFSET = 10

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
    nodes: {},
    lessImportantLinks: []

    // we may have multiple nodes
    // we have two types of node:
    //   - main node
    //   - partner node
  }

  const getters = {
    whakapapaView: state => state.view,
    // whakapapaView: state => state.loading ? loadingView : state.view, // TODO
    nestedWhakapapa: state => state.nestedWhakapapa,
    whakapapa: state => {
      throw new Error('WHO IS USING THIS')
      // return state.whakapapa
    },
    nodes: state => {
      return state.nodes
    },
    // getNode: state => (id) => {
    //   return state.nodes[id]
    // },
    lessImportantLinks: state => {
      return state.lessImportantLinks
    }
  }

  const mutations = {
    setView (state, view) {
      state.view = view
    },
    addNodes (state, nodes) {
      if (!nodes.length) return

      const change = nodes.reduce((acc, node) => {
        const id = node.id || (node.data && node.data.id)
        if (!id) return acc

        acc[id] = [...(state.nodes[id] || []), node]
        return acc
      }, {})

      // this assignment stimulates lessImportantLinks to update
      // NOTE this is spamming a lot of changes at the moment
      const newValue = {
        ...state.nodes,
        ...change
      }
      state.nodes = newValue
    },
    lessImportantLinks (state, links) {
      state.lessImportantLinks = links
    },
    resetWhakapapaView (state) {
      state.nodes = []
      state.nestedWhakapapa = {}
      state.view = loadingView
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
    calculateLessImportantLinks ({ commit, state }) {
      // TODO - call this when loading graph is done?
      //
      // TODO reset state when loading new whakapapa

      if (isEmpty(state.nodes) || isEmpty(state.view.importantRelationships)) return commit('lessImportantLinks', [])

      const links = []
      // // for each importantRelationship find the x,y coords on the graph and create set the link
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

          const coords = {
            startX: node.x + node.radius,
            startY: node.y + node.radius,
            endX: targetNode.x + targetNode.radius,
            endY: targetNode.y + targetNode.radius
          }
          const offset = (coords.startX < coords.endX) ? LINK_OFFSET : -1 * LINK_OFFSET
          coords.startX += offset
          coords.endX -= offset

          const branch = (coords.endY - coords.startY) / 2

          links.push({
            id: [node.data.id, targetNode.data.id].join('-'),
            style: {
              fill: 'none',
              // stroke: settings.color.getColor(0),
              stroke: '#f0f',
              opacity: settings.opacity,
              strokeWidth: settings.thickness,
              strokeLinejoin: 'round',
              strokeDasharray: isDashed ? 2.5 : 0
            },
            d: settings.path(coords, branch)
          })
        })
      })

      commit('lessImportantLinks', links)
    },
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
      commit('resetWhakapapaView')
      const view = await dispatch('getWhakapapaView', id)
      if (view) commit('setView', view)
    },
    resetWhakapapaView ({ commit }) {
      commit('resetWhakapapaView')
    },
    addNode ({ commit }, node) {
      // TODO change is so that addNodes is only hit once per second!
      commit('addNodes', [node])
    },
    setNestedWhakapapa ({ commit, dispatch }, nestedWhakapapa) {
      commit('setNestedWhakapapa', nestedWhakapapa)
      dispatch('calculateLessImportantLinks')
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
