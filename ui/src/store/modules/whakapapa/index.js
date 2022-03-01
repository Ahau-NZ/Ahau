import Vue from 'vue'
import uniqby from 'lodash.uniqby'
import pick from 'lodash.pick'

import { getWhakapapaView, getWhakapapaViews, saveWhakapapaView, getFamilyLinks } from './lib/apollo-helpers'
import getExtendedFamily from './lib/get-extended-family'

import { saveLink } from '../../../lib/link-helpers'
import { ACCESS_KAITIAKI } from '../../../lib/constants.js'

const UNKNOWN_REL_TYPE = 'unknown'

const defaultView = () => ({
  name: 'Loading...',
  description: '',
  focus: null,
  recps: null,
  image: { uri: '' },
  ignoredProfiles: [],
  importantRelationships: {},
  recordCount: 0,
  extendedFamily: true,

  // settings
  tree: true,
  table: false
})

const defaultViewChanges = () => ({
  focus: null, // can temporarily over-ride the saved view.focus
  collapsed: { // maps node.data.id to Boolean (default false)
  }
})

// vuex/whakapapa is about creating a whakapapa graph and what should be in it.
// This takes into account:
//    - ignoredProfiles,
//    - importantRelationships,
//    - extendedFamily view
//
// It DOES NOT include layout calculations (see vuex/tree)
//
// NOTE concepts like "children" and "partners" in this file refer to graphChildren and graphPartners
// use getChildRelationshipType, getPartnerRelationshipType to determine relationships

export default function (apollo) {
  const state = {
    view: defaultView(),
    viewChanges: defaultViewChanges(),
    lastView: defaultView(),

    childLinks: {
      // [parentId]: {
      //   [childId]: relationshipType
      // }
    },
    partnerLinks: {
      // [partnerA]: {
      //   [partnerB]: relationshipType
      // }
    }
  }

  const getters = {
    whakapapaView: state => state.view,
    focus: state => state.viewChanges.focus || state.view.focus,
    ignoredProfileIds: state => state.view.ignoredProfiles,
    importantRelationships: state => state.view.importantRelationships,
    // TODO search app for this term - we see that this.view.importantRelationships is being used a lot?
    showExtendedFamily: state => state.view.extendedFamily,

    lastWhakapapaView: state => state.lastView,

    /* getter methods */
    isCollapsedNode: state => (id) => Boolean(state.viewChanges.collapsed[id]),
    isNotIgnored: state => (id) => !state.view.ignoredProfiles.includes(id),
    getImportantRelationship: state => (id) => state.view.importantRelationships[id],
    isRawImportantLink: state => (targetId, otherId) => {
      const rule = state.view.importantRelationships[targetId]
      if (!rule) return true
      return rule.primary.profileId === otherId
    },
    isImportantLink: (state, getters) => (targetId, otherId) => (
      // EITHER other has importantRelationship with the target
      getters.isRawImportantLink(targetId, otherId) ||
      // OR one of others partners has an importantRelationship with the target
      getters.getRawPartnerIds(otherId).some(partnerId => getters.isRawImportantLink(targetId, partnerId))
    ),
    getChildRelationshipType: state => (parent, child) => {
      return state.childLinks[parent] && state.childLinks[parent][child]
    },
    getPartnerRelationshipType: state => (parent, child) => {
      const [partnerA, partnerB] = [parent, child].sort()

      return state.partnerLinks[partnerA] && state.partnerLinks[partnerA][partnerB]
    },
    // here "raw" means unfiltered links
    getRawChildIds: state => (parentId) => {
      return Object.keys(state.childLinks[parentId] || {})
    },
    getRawParentIds: state => (childId) => {
      return Object.keys(state.childLinks)
        // find parents who have a relationship with this child
        .filter(parentId => state.childLinks[parentId] && state.childLinks[parentId][childId] !== undefined)
    },
    getRawPartnerIds: state => (partnerId) => {
      return [
        ...Object.keys(state.partnerLinks[partnerId] || {}),
        ...Object.keys(state.partnerLinks).filter(partnerA => state.partnerLinks[partnerA][partnerId])
      ]
    },

    /* higher order getters */
    getChildIds: (state, getters) => (parentId) => {
      // NOTE this gets the ids of childrenNodes in the graph
      // WARNING this may include children who are not rendered in the graph because they are extendedFamily
      if (getters.isCollapsedNode(parentId)) return []

      return getters.getRawChildIds(parentId)
        .filter(childId => !state.view.ignoredProfiles.includes(childId))
        // NOTE may need to filter out ignoredProfiles here
        .filter(childId => getters.isImportantLink(childId, parentId))
    },
    getParentIds: (state, getters) => (childId) => {
      let parentIds = getters.getRawParentIds(childId)

      if (!state.view.extendedFamily) {
        // only include parents which are
        //   - EITHER birth parent
        //   - OR there is line from focus -> parentId -> child (so they are rendered)
        parentIds = parentIds
          .filter(parentId => {
            if (getters.getChildRelationshipType(parentId, childId) === 'birth') return true
            return (
              (
                (getters.getPartnerRelationshipType(state.view.focus, parentId) !== undefined) ||
                getters.isDescendant(getters.focus, parentId)
              ) && // connection from focus -> parentId
              getters.isDescendant(parentId, childId) // connection from parentId -> childId
            )
          })
      }

      return parentIds
        .filter(parentId => getters.isImportantLink(childId, parentId))
    },
    isDescendant: (state, getters) => (parentId, childId) => {
      // NOTE this checks if there is a descendant line within the rendered graph
      // as this uses gettters.getChildIds
      if (parentId === childId) return true

      let result = false
      const queue = [parentId]
      while (result === false && queue.length) {
        const parentId = queue.shift()
        getters.getChildIds(parentId).forEach(id => {
          if (id === childId) result = true
          queue.push(id)
        })
      }
      return result
    },
    getPartnerIds: (state, getters) => (id) => {
      if (getters.isCollapsedNode(id)) return []

      if (!state.view.extendedFamily) {
        return getters.getRawPartnerIds(id).filter(getters.isNotIgnored)
      }
      // else
      const { partners } = getExtendedFamily(state, getters, [id])
      return partners
    },
    nestedDescendants: (state, getters) => {
      // TODO rename descendantsTree
      if (!getters.focus) return {}
      // starts at the focus and builds the tree as the data comes in

      return getters.buildNestedDescendants(getters.focus)
    },
    buildNestedDescendants: (state, getters) => (parentId, opts = {}) => {
      const {
        lineage = new Set()
      } = opts
      lineage.add(parentId)

      let childIds
      if (!state.view.extendedFamily) {
        childIds = getters.getChildIds(parentId)
      } // eslint-disable-line
      else {
        const extendedFamily = getExtendedFamily(state, getters, [parentId])
        childIds = extendedFamily.children
      }

      return {
        id: parentId,
        children: childIds
          .filter(childId => !lineage.has(childId)) // never recurse into a parent already seen
          .filter(childId => getters.isImportantLink(childId, parentId))
          .map(childId => {
            // console.log('recursing', childId)
            return getters.buildNestedDescendants(childId, { lineage: new Set(lineage) })
            // we create a new "lineage", so that each branching of the tree can record
            // it's own lineage of people, allowing duplicate profiles across branches
            // (this behaves like a "path" except we use a set because we don't care about author)
          })
      }
    },
    secondaryLinks: (state, getters) => {
      // for each importantRelationship link (which targets a person)
      // look for parents that rule has disconnected them from.
      // record those links

      return Object.entries(state.view.importantRelationships).reduce(
        (acc, [ruleTarget, rule]) => {
          const links = getters.getRawParentIds(ruleTarget)
            .filter(parentId => !getters.isImportantLink(ruleTarget, parentId))
            .map(parentId => ({
              parent: parentId,
              child: ruleTarget,
              relationshipType: state.childLinks[parentId][ruleTarget]
            }))

          return acc.concat(links)
        },
        []
      )
    }
  }

  const mutations = {
    setView (state, view) {
      state.lastView = state.view

      if (view.extededFamily === undefined) view.extendedFamily = false
      // NOTE 2022-02-11 mix
      // this default false was set to accelerate the refactor, may revert later

      // convert the importantRelationships to an easier lookup
      if (Array.isArray(view.importantRelationships)) {
        view.importantRelationships = view.importantRelationships.reduce(
          (acc, rule) => {
            acc[rule.profileId] = rule
            return acc
          },
          {}
        )
      }

      // set the tree settings to display the tree by default
      view.tree = state.lastView ? state.lastView.tree : true
      view.table = state.lastView ? !state.lastView.tree : false

      state.view = view
    },
    setViewFocus (state, profileId) {
      state.viewChanges.focus = profileId
    },
    toggleViewMode (state) {
      state.view.tree = !state.view.tree
      state.view.table = !state.view.tree
    },
    setExtendedFamily (state, extended) {
      state.view.extendedFamily = extended
    },
    toggleNodeCollapse (state, nodeId) {
      Vue.set(state.viewChanges.collapsed, nodeId, !state.viewChanges.collapsed[nodeId])
    },
    resetWhakapapaView (state) {
      state.lastView = state.view
      state.view = defaultView()
      state.viewChanges = defaultViewChanges()
    },

    // methods for manipulating whakapapa links
    addLinks (state, { childLinks = [], partnerLinks = [] }) {
      // NOTE we do a bulk mutation because this reduces the number of updates
      // in the state = less thrashing
      childLinks.forEach(({ parent, child, relationshipType }) => {
        const newChildren = {
          ...(state.childLinks[parent] || {}),
          [child]: relationshipType || UNKNOWN_REL_TYPE
        }

        Vue.set(state.childLinks, parent, newChildren)
      })

      partnerLinks.forEach(({ parent, child, relationshipType }) => {
        const [partnerA, partnerB] = [parent, child].sort()
        const newPartners = {
          ...(state.partnerLinks[partnerA] || {}),
          [partnerB]: relationshipType || UNKNOWN_REL_TYPE
        }

        Vue.set(state.partnerLinks, partnerA, newPartners)
      })
    },
    removeLinksToProfile (state, profileId) {
      // NOTE this exists to be able to disconnect nodes which should not be in graph
      // e.g. because it's discovered to profile is tombstoned

      /* remove from childLinks */
      if (state.childLinks[profileId]) state.childLinks[profileId] = {}

      Object.keys(state.childLinks).forEach(parentId => {
        if (state.childLinks[parentId] && state.childLinks[parentId][profileId] !== undefined) {
          const newLinks = { ...state.childLinks[parentId] }
          delete newLinks[profileId]

          state.childLinks[parentId] = newLinks
        }
      })

      /* remove from partnerLinks */
      if (state.partnerLinks[profileId]) state.partnerLinks[profileId] = {}

      Object.keys(state.partnerLinks).forEach(parentId => {
        if (state.partnerLinks[parentId] && state.partnerLinks[parentId] !== undefined) {
          const newLinks = { ...state.partnerLinks[parentId] }
          delete newLinks[profileId]
          state.partnerLinks[parentId] = newLinks
        }
      })
    }
  }

  const actions = {
    setViewFocus ({ commit, dispatch, getters }, id) {
      commit('setViewFocus', id)
      dispatch('loadDescendants', getters.focus)
    },
    toggleViewMode ({ commit, dispatch }) {
      commit('toggleViewMode')
      dispatch('setExtendedFamily', false)
    },
    setExtendedFamily ({ state, commit, dispatch, getters }, extended) {
      commit('setExtendedFamily', extended)
      dispatch('loadDescendants', getters.focus)
    },
    toggleNodeCollapse ({ commit }, nodeId) {
      commit('toggleNodeCollapse', nodeId)
    },
    addLinks ({ commit }, links) {
      commit('addLinks', links)
    },
    removeLinksToProfile ({ commit }, profileId) {
      commit('removeLinksToProfile', profileId)
    },
    async createWhakapapaView ({ dispatch }, input) {
      if (!input.authors) {
        input.authors = {
          add: ['*']
        }
      }

      return dispatch('saveWhakapapaView', input)
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
    async getFamilyLinks (context, opts = {}) {
      const { profileId, extended = true } = opts
      try {
        const res = await apollo.query(getFamilyLinks(profileId, extended))
        if (res.errors) throw new Error(res.errors)

        return res.data.loadFamilyOfPerson
      } catch (err) {
        console.error('error getting family links', err)
        // TODO error alert message
        return { childLinks: [], partnerLinks: [] }
      }
    },
    async loadWhakapapaView ({ dispatch }, id) {
      dispatch('resetWhakapapaView')
      const view = await dispatch('getWhakapapaView', id)
      if (view) {
        dispatch('setView', view)
        dispatch('loadDescendants', view.focus)
      }
    },
    async loadDescendants ({ state, dispatch, commit, getters, rootGetters }, opts) {
      if (!opts) return
      if (typeof opts === 'string') return dispatch('loadDescendants', { profileId: opts })

      const { profileId, loaded = new Set() } = opts
      if (!profileId || loaded.has(profileId)) return

      loaded.add(profileId)

      // load a persons profile into state if we are looking at the table
      if (getters.isTable) dispatch('person/loadPersonFull', profileId, { root: true })

      let { childLinks, partnerLinks } = await dispatch('getFamilyLinks', { profileId, extended: true })
      // NOTE we get extended family links in every case right now (extended: true)
      // becuase they help with rendering, and mean transition to the extendedFamily view is smoother
      // const links = await dispatch('getFamilyLinks', { profileId, extended: state.view.extendedFamily

      const isLiveLink = (link) => (
        // filter links involving ignored profiles
        getters.isNotIgnored(link.child) && getters.isNotIgnored(link.parent) &&
        // filter links involving tombstoned profiles
        !rootGetters['person/isTombstoned'](link.child) && !rootGetters['person/isTombstoned'](link.parent)
      )

      childLinks = childLinks.filter(isLiveLink)
      partnerLinks = partnerLinks.filter(isLiveLink)

      if (getters.isTable) {
      // get all the partners profiles
        partnerLinks.forEach(link => {
          const partnerId = link.child === profileId ? link.parent : link.child
          dispatch('person/loadPersonMinimal', partnerId, { root: true })
        })
      }

      commit('addLinks', { childLinks, partnerLinks })

      // // recurse through children
      childLinks
        // keep links which from the profileId down to a child
        .filter(link => link.parent === profileId && link.child !== profileId)
        // keep links which are importantRelationship links (or not mentioned in a rule)
        .filter(link => getters.isImportantLink(link.child, profileId))
        .map(link => dispatch('loadDescendants', { profileId: link.child, loaded }))
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
    setView ({ commit }, view) {
      commit('setView', view)
    },
    resetWhakapapaView ({ commit }) {
      commit('resetWhakapapaView')
    },
    addProfileLocation ({ commit }, node) {
      commit('addProfileLocation', node)
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
      const isRootNode = state.view.focus === person.id

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
    },

    // create a whakapapa from rows containing a profile + link
    async bulkCreateWhakapapaView ({ dispatch }, { whakapapaViewInput, rows }) {
      dispatch('setLoading', true, { root: true })

      const { recps } = whakapapaViewInput

      if (!recps) throw new Error('no recps found on the whakapapa input!')

      // create a profile for each row in the csv
      const { profiles, links } = await dispatch('bulkCreateProfiles', { rows, recps })

      // create all the links from the profiles
      await dispatch('bulkCreateLinks', { links, profiles, recps })

      // the first row is the focus
      whakapapaViewInput.focus = profiles[rows[0].csvId]

      // create whakapapa with first person in the csv as the focus
      return dispatch('createWhakapapaView', whakapapaViewInput) // whakapapaId
    },
    async bulkCreateProfiles ({ dispatch, rootGetters }, { rows, recps }) {
      const profiles = {}
      const links = rows
        .map(row => row.link)
        .filter(Boolean)

      /*
        NOTE:
        profiles = {
          [csvId]: profileId
        }

        links = [{ childCsvId, parentCsvId, relationshipType }]
      */
      const res = await Promise.all(
        rows.map(async ({ csvId, profile }) => {
          if (!profile) return

          profile.recps = recps
          profile.type = rootGetters.currentAccess.type === ACCESS_KAITIAKI ? 'person/admin' : 'person'
          profile.authors = {
            add: ['*']
          }

          var profileId = await dispatch('person/createPerson', profile, { root: true })
          profiles[csvId] = profileId
        })
      )
        .catch((err) => {
          console.error('failed to create profile with csv bulk create', err)
          dispatch('setLoading', false, { root: true })
        })

      if (!res) return

      return { profiles, links }
    },
    async bulkCreateLinks ({ dispatch }, { recps, links, profiles }) {
      await Promise.all(
        links.map(link => {
          const { parentCsvId, childCsvId, relationshipType } = link

          const relationship = {
            // get the parent and child's actual profileId
            parent: profiles[parentCsvId],
            child: profiles[childCsvId],
            recps
          }

          if (relationshipType === 'partner') return dispatch('createPartnerLink', relationship)

          // TODO: check if this is important
          if (relationshipType !== '' && relationshipType !== null) relationship.relationshipType = relationshipType

          return dispatch('createChildLink', relationship)
        })
      )
    },
    async createChildLink ({ dispatch }, input) {
      input.type = 'link/profile-profile/child'

      await dispatch('createLink', input)
    },
    async createPartnerLink ({ dispatch }, input) {
      input = pick(input, ['child', 'parent', 'recps'])
      input.type = 'link/profile-profile/partner'

      await dispatch('createLink', input)
    },
    async createLink (context, input) {
      try {
        const res = await apollo.mutate(
          saveLink(input)
        )

        if (res.errors) throw res.errors

        return res.data.saveLink
      } catch (err) {
        console.log('failed to create link', input)
        console.log(err)
      }
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
