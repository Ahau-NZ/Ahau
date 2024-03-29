/* eslint brace-style: ["error", "stroustrup", { "allowSingleLine": true }] */

import Vue from 'vue'
import { uniqBy as uniqby } from 'lodash-es'

import importFromCsvActions from './import-from-csv-actions.mjs'
import { getWhakapapaView, getDescendantLinks, getWhakapapaViews, saveWhakapapaView, getFamilyLinks } from './lib/apollo-helpers.mjs'
import getExtendedFamily from './lib/get-extended-family.mjs'
import FindPathToRoot from './lib/find-path-to-root.mjs'

import { saveLink, whakapapaLink } from '../../../lib/link-helpers.mjs'

const DEFAULT_DEPTH = 2
// minimum number of generations to load before hiding further children
const MIN_LOADED_PROFILES = 10
// minimum number of profiles to initially aim to load
// this helps take into account graphs which start out line a long line before spreading out

// NOTE: the app assumes that the default childLink relationshipType is birth
// when some are saved as null, it sets them to birth by default so
// the graph displays these links correctly
const FALLBACK_CHILD_REL = 'birth'
const FALLBACK_PARTNER_REL = 'partners'

const defaultChanges = () => ({
  focus: null, // can temporarily over-ride the saved view.focus
  autoCollapse: true,
  collapsed: { // maps node.data.id to Boolean (default false)
  },
  showExtendedFamily: false
})

const defaultView = () => ({
  name: 'Loading...',
  description: '',
  focus: null,
  recps: null,
  image: { uri: '' },
  ignoredProfiles: [], // TODO change to a map
  importantRelationships: {},
  /*
    maps profileId => Rule about that profileId
      Rule = {
        profileId,
        primary: { profileId, relationshipType },
        other: [
          { profileId, relationshipType }
        ]
      }
  */
  recordCount: 0,

  // settings
  tree: true,
  table: false,
  changes: defaultChanges()
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
// use getChildType, getPartnerType to determine relationships

export default function (apollo) {
  const state = {
    view: defaultView(),
    lastViewId: null,
    // a store to save previous whakapapa sessions
    views: {
      // [viewId]: { view }
    },
    childLinks: {
      // [parentId]: {
      //   [childId]: relationshipType
      // }
    },
    partnerLinks: {
      // [partnerA]: {
      //   [partnerB]: relationshipType
      // }
    },
    activeQueryCount: 0,
    // loading needs to be a boolean so that watcher isnt triggered when count changes
    loadingWhakapapa: false,
    path: []
  }

  const getters = {
    whakapapaView: state => state.view,
    lastWhakapapaView: state => state.lastViewId ? state.views[state.lastViewId] : null,
    focus: state => state.view.changes.focus || state.view.focus,
    ignoredProfileIds: state => state.view.ignoredProfiles,
    showExtendedFamily: state => Boolean(state.view.changes.showExtendedFamily),
    autoCollapse: state => state.view.changes.autoCollapse,
    isLoadingWhakapapa: state => state.loadingCount || state.loadingWhakapapa,
    isOpenWhakapapa: (state) => (whakapapaId) => state.view === whakapapaId,
    findPathToRoot: (_, getters) => (start) => FindPathToRoot(getters)(start),
    pathToRoot: (state, getters, rootState, rootGetters) => {
      const id = rootGetters['tree/searchedProfileId']
      if (!id) return []
      return getters.findPathToRoot(id)
    },
    /* getter methods */
    isCollapsedNode: (state, getters) => (id) => {
      const path = getters.pathToRoot
      if (path && path.length && path.includes(id)) return false
      return Boolean(state.view.changes.collapsed[id])
    },
    isNotIgnored: state => (id) => !state.view.ignoredProfiles.includes(id),
    getImportantRelationship: (state, getters) => (targetId) => {
      const rule = state.view.importantRelationships[targetId]
      if (!rule) return
      if (!getters.isDuplicate(rule.profileId)) return
      return rule
    },

    isRawImportantLink: (state, getters) => (targetId, otherId) => {
      const rule = getters.getImportantRelationship(targetId)
      if (!rule) return true
      return rule.primary.profileId === otherId
    },
    isImportantLink: (state, getters) => (targetId, otherId) => (
      // EITHER other has importantRelationship with the target
      getters.isRawImportantLink(targetId, otherId) ||
      // OR one of others partners has an importantRelationship with the target
      getters.getRawPartnerIds(otherId).some(partnerId => getters.isRawImportantLink(targetId, partnerId))
    ),
    isDuplicate: (state, getters) => (id) => {
      // this method lets you check if an id would appear more than once if the graph was drawn
      // (respecting: [ignoredProfiles], not respecting: [isRawImportantLink, showExtendedFamily]

      // NOTE showExtendedFamily would change how partners and children are calculated

      let foundCount = 0
      const queue = [getters.focus]
      const seenRootNodeIds = new Set()
      while (foundCount < 2 && queue.length > 0) {
        const profileId = queue.shift()

        // for each rootNode, check:
        // - rootNode
        // - partners
        if (profileId === id) foundCount++

        if (seenRootNodeIds.has(profileId)) continue // stops infinite loops
        else seenRootNodeIds.add(profileId)

        const partnerIds = getters.getRawPartnerIds(profileId)
          .filter(getters.isNotIgnored)
        partnerIds.forEach(partnerId => { if (partnerId === id) foundCount++ })

        const childIds = getters.getRawChildIds(profileId)
          .filter(getters.isNotIgnored)

        // queue up processing of children of rootNode/partners
        const partnerChildIds = partnerIds
          .flatMap(parentId => getters.getRawChildIds(parentId))
          .filter(childId => getters.isNotIgnored(childId) && !childIds.includes(childId))

        new Set([...childIds, ...partnerChildIds])
          .forEach(childId => {
            queue.push(childId)
          })
      }

      return foundCount > 1
    },
    getChildType: state => (parent, child) => {
      return state.childLinks[parent] && state.childLinks[parent][child]
    },
    getPartnerType: state => (parent, child) => {
      const [partnerA, partnerB] = [parent, child].sort()
      return state.partnerLinks[partnerA] && state.partnerLinks[partnerA][partnerB]
    },
    // here "raw" means unfiltered links

    getRawChildIds: state => (parentId) => {
      return Object.keys(state.childLinks[parentId] || {})
    },
    getRawParentIds: (state, getters) => (childId) => {
      return Object.keys(state.childLinks)
        .filter(parentId => getters.getChildType(parentId, childId))
        // find parents who have a relationship with this child
    },
    getRawPartnerIds: state => (partnerId) => {
      return [
        ...Object.keys(state.partnerLinks[partnerId] || {}),
        ...Object.keys(state.partnerLinks).filter(partnerA => state.partnerLinks[partnerA][partnerId])
      ]
    },
    isInWhakapapa: (state, getters) => (id) => {
      const childLinks = state.childLinks[id]
      if (childLinks) return true

      const parentIds = getters.getRawParentIds(id)
      if (parentIds && parentIds.length) return true

      const partnerIds = getters.getRawPartnerIds(id)
      if (partnerIds && partnerIds.length) return true

      return false
    },
    // TODO 2022-04-11 mix
    // consider splitting out vuex/links + vuex/whakapapa then we could just have getChildIds for each!
    // maybe all the filtering stuff should happen over in tree...

    /* higher order getters */
    getChildIds: (state, getters) => (parentId, opts) => {
      // NOTE this gets the ids of childrenNodes in the graph
      if (!parentId) return []

      if (
        firstDefined(
          opts && opts.showCollapsed !== true, // if set true, over-ride to show collapsed children
          getters.isCollapsedNode(parentId) // fallback
        )
      ) return []

      if (
        firstDefined(
          opts && opts.showExtendedFamily, // if set, over-ride getters.showExtendedFamily
          getters.showExtendedFamily // fallback
        )
      ) return getExtendedFamily(state, getters)(parentId).children

      return getters.getRawChildIds(parentId)
        .filter(getters.isNotIgnored)
        .filter(childId => getters.isImportantLink(childId, parentId))
    },
    getParentIds: (state, getters) => (childId) => {
      let parentIds = getters.getRawParentIds(childId)

      if (!getters.showExtendedFamily) {
        // only include parents which are
        //   - EITHER birth parent
        //   - OR there is line from focus -> parentId -> child (so they are rendered)
        parentIds = parentIds
          .filter(parentId => {
            if (getters.getChildType(parentId, childId) === 'birth') return true

            return (
              (
                (getters.getPartnerType(state.view.focus, parentId)) ||
                getters.isDescendant(getters.focus, parentId)
              ) && // connection from focus -> parentId
              getters.isDescendant(parentId, childId) // connection from parentId -> childId
            )
          })
      }

      return parentIds
        .filter(parentId => getters.isImportantLink(childId, parentId))
    },
    getSiblingIds: (state, getters) => (profileId) => {
      const { getRawParentIds, getRawChildIds } = getters

      const childIds = getRawParentIds(profileId)
        .flatMap(parentId => getRawChildIds(parentId))

      const childIdSet = new Set(childIds)
      childIdSet.delete(profileId)

      return Array.from(childIdSet)
    },
    isDescendant: (state, getters) => (parentId, childId) => {
      // NOTE this checks if there is a descendant line within the rendered graph
      // as this uses gettters.getChildIds
      if (parentId === childId) return true

      let result = false
      const queue = [parentId]
      while (result === false && queue.length) {
        const parentId = queue.shift()
        for (const id of getters.getChildIds(parentId)) {
          if (id === childId) result = true
          queue.push(id)
        }
      }
      return result
    },
    getPartnerIds: (state, getters) => (id, opts) => {
      // NOTE this gets the partner ids on the graph
      if (!id) return []
      if (
        firstDefined(
          opts && opts.showCollapsed !== true, // if set true, over-ride and include collapsed nodes
          getters.isCollapsedNode(id) // fallback
        )
      ) return []

      if (
        firstDefined(
          opts && opts.showExtendedFamily, // if set, over-ride getters.showExtendedFamily
          getters.showExtendedFamily // fallback
        )
      ) return getExtendedFamily(state, getters)(id).partners
      else {
        return getters.getRawPartnerIds(id)
          .filter(getters.isNotIgnored)
      }
    },
    nestedDescendants: (state, getters) => {
      if (!getters.focus) return {}
      // starts at the focus and builds the tree as the data comes in

      return getters.buildNestedDescendants(getters.focus)
    },
    buildNestedDescendants: (state, getters) => (parentId, opts = {}) => {
      const {
        lineage = new Set()
      } = opts
      lineage.add(parentId)
      const result = {
        id: parentId,
        children: getters.getChildIds(parentId)
          .filter(childId => !lineage.has(childId)) // never recurse into a parent already seen
          .map(childId => {
            return getters.buildNestedDescendants(childId, { lineage: new Set(lineage) })
            // we create a new "lineage", so that each branching of the tree can record
            // it's own lineage of people, allowing duplicate profiles across branches
            // (this behaves like a "path" except we use a set because we don't care about order)
          })
      }
      return result
    },
    secondaryLinks: (state, getters) => {
      // for each importantRelationship link (which targets a person)
      // look for parents that rule has disconnected them from.
      // record those links

      return Object.entries(state.view.importantRelationships).reduce(
        (acc, [ruleTarget, rule]) => {
          const links = getters.getRawParentIds(ruleTarget)
            .filter(parentId => {
              return !getters.isImportantLink(ruleTarget, parentId)
            })
            .map(parentId => {
              return ({
                parent: parentId,
                child: ruleTarget,
                relationshipType: getters.getChildType(parentId, ruleTarget)
              })
            })
          return acc.concat(links)
        },
        []
      )
    }
  }

  const mutations = {
    setView (state, view) {
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
      // update state.view values with those passed in here
      state.view = {
        ...state.view,
        ...view
      }
      // set loadingwhakapapa:true in loadWhakapapaView
      state.loadingWhakapapa = false
    },
    updateViewInViews (state, view) {
      Vue.set(state.views, view.id, view)
    },
    setViewFocus (state, profileId) {
      state.view.changes.focus = profileId
    },
    toggleViewMode (state) {
      state.view.tree = !state.view.tree
      state.view.table = !state.view.tree
    },
    setExtendedFamily (state, bool = false) {
      state.view.changes.showExtendedFamily = bool
    },
    setNodeCollapsed (state, { nodeId, isCollapsed }) {
      Vue.set(state.view.changes.collapsed, nodeId, isCollapsed)
    },
    resetWhakapapaView (state) {
      state.view.changes.focus = null
      // Preserve state of previously opened sessions for quick reloading
      Vue.set(state.views, state.view.id, state.view)
      state.lastViewId = state.view.id
      state.view = defaultView()
    },

    // methods for manipulating whakapapa links
    addLinks (state, { childLinks = [], partnerLinks = [], isLoadingFocus = false }) {
      state.loadingWhakapapa = true
      // NOTE we do a bulk mutation because this reduces the number of updates
      // in the state = less thrashing
      // NOTE we use an if statement to check if we are adding a new link so lets add it to the end of the family instead of at the start
      if (childLinks.length > 1) {
        childLinks.forEach(({ parent, child, relationshipType }) => {
          const newChildren = {
            [child]: relationshipType || FALLBACK_CHILD_REL,
            ...(state.childLinks[parent] || {})
          }
          Vue.set(state.childLinks, parent, newChildren)
        })
      }
      else {
        childLinks.forEach(({ parent, child, relationshipType }) => {
          const newChildren = {
            ...(state.childLinks[parent] || {}),
            [child]: relationshipType || FALLBACK_CHILD_REL
          }
          Vue.set(state.childLinks, parent, newChildren)
        })
      }

      // NOTE: this code prevents inferred partners (birth parents) on the same whakapapa to prevent creating duplicates
      const importantBirthRel = Object.values(state.view.importantRelationships)
        .filter(rel => rel.primary.relationshipType === 'birth')

      partnerLinks
        // filter the inferred partners (birth parents)
        .filter(partner => {
          return !importantBirthRel.some(rule => {
            // if the partner.parent (a) is the rel.primary and partner.child (b) is the rel.other
            return (partner.parent === rule.primary.profileId && rule.other.some(other => other.profileId === partner.child)) ||
            // or if the partner.parent (b) is the rel.primary and partner.child (a) is the rel.other
            (partner.child === rule.primary.profileId && rule.other.some(other => other.profileId === partner.parent))
          })
        })
        .forEach(({ parent, child, relationshipType }) => {
          const [partnerA, partnerB] = [parent, child].sort()
          const newPartners = {
            ...(state.partnerLinks[partnerA] || {}),
            [partnerB]: relationshipType || FALLBACK_PARTNER_REL
          }
          Vue.set(state.partnerLinks, partnerA, newPartners)
        })

      if (isLoadingFocus) {
        if (!state.view.focus) {
          console.error('expected state.view.focus to be set for auto-collapsing')
          state.loadingWhakapapa = false
          return
        }
        walkTree(state.childLinks, state.view.focus, (profileId, depth, processed) => {
          if (shouldCollapseChildren(processed.size, depth, isLoadingFocus)) {
            // copy of setNodeCollapsed mutation
            Vue.set(state.view.changes.collapsed, profileId, true)
          }
        })
      }
      state.loadingWhakapapa = false
    },
    removeLinksToProfile (state, profileId) {
      // NOTE this exists to be able to disconnect nodes which should not be in graph
      // e.g. because it's discovered to profile is tombstoned

      /* remove from childLinks */
      if (state.childLinks[profileId]) state.childLinks[profileId] = {}

      for (const parentId in state.childLinks) {
        if (state.childLinks[parentId] && state.childLinks[parentId][profileId]) {
          const newLinks = { ...state.childLinks[parentId] }
          delete newLinks[profileId]
          state.childLinks[parentId] = newLinks
        }
      }

      /* remove from partnerLinks */
      if (state.partnerLinks[profileId]) state.partnerLinks[profileId] = {}

      for (const partnerA in state.partnerLinks) {
        if (state.partnerLinks[partnerA] && state.partnerLinks[partnerA][profileId]) {
          const newLinks = { ...state.partnerLinks[partnerA] }
          delete newLinks[profileId]
          state.partnerLinks[partnerA] = newLinks
        }
      }
    },

    removeChildLink (state, { parent, child }) {
      if (!parent || !child) return

      if (state.childLinks[parent] && state.childLinks[parent][child]) {
        const newLinks = { ...state.childLinks[parent] }
        delete newLinks[child]
        state.childLinks[parent] = newLinks
      }
    },
    removePartnerLink (state, { parent, child }) {
      if (!parent || !child) return

      const [partnerA, partnerB] = [parent, child].sort()

      if (state.partnerLinks[partnerA] && state.partnerLinks[partnerA][partnerB]) {
        const newLinks = { ...state.partnerLinks[partnerA] }
        delete newLinks[partnerB]
        state.partnerLinks[partnerA] = newLinks
      }
    },
    modifyActiveQueryCount (state, number) {
      if (!number) return
      state.activeQueryCount = state.activeQueryCount + number
      state.loadingWhakapapa = state.activeQueryCount > 0
    },

    setAutoCollapse (state, autoCollapse) {
      state.view.changes.autoCollapse = autoCollapse
    },
    resetCollapsed (state) {
      state.view.changes.collapsed = {}
    },
    setPath (state, path) {
      state.path = path
    }
  }

  const actions = {
    resetWhakapapaView ({ commit }) { commit('resetWhakapapaView') },
    updateViewInViews ({ commit }, view) { commit('updateViewInViews', view) },
    addLinks ({ commit }, links) { commit('addLinks', links) },
    setExtendedFamily ({ commit }, extended) { commit('setExtendedFamily', extended) },
    toggleViewMode ({ commit, dispatch }) { commit('toggleViewMode') },
    toggleNodeCollapse ({ state, commit }, nodeId) {
      commit('setNodeCollapsed', {
        nodeId,
        isCollapsed: !state.view.changes.collapsed[nodeId]
      })
    },
    removeLinksToProfile ({ state, commit }, profileId) {
      commit('removeLinksToProfile', profileId)
    },
    async setViewFocus ({ commit, dispatch, getters }, id) {
      commit('setViewFocus', id)

      const links = await dispatch('getDescendantLinks', id)
      if (links) dispatch('addLinks', links)
    },

    async createWhakapapaView ({ dispatch }, input) {
      if (!input.authors) {
        input.authors = {
          add: ['*']
        }
      }

      const result = await apollo.niceMutation(dispatch, saveWhakapapaView(input))
      if (!result) return

      return result
    },
    async getWhakapapaView ({ dispatch }, viewId) {
      return apollo.niceQuery(dispatch, getWhakapapaView(viewId))
    },
    async getDescendantLinks ({ dispatch }, profileId) {
      return apollo.niceQuery(dispatch, getDescendantLinks(profileId))
    },
    async getWhakapapaViews ({ dispatch }, { groupId } = {}) {
      return (
        await apollo.niceQuery(dispatch, getWhakapapaViews(groupId)) ||
        []
      )
    },
    async getFamilyLinks ({ commit, dispatch, rootGetters }, { profileId, extended = true } = {}) {
      commit('modifyActiveQueryCount', 1)
      const result = await apollo.niceQuery(dispatch, getFamilyLinks(profileId, extended))
      commit('modifyActiveQueryCount', -1)

      if (!result) return

      const { childLinks, partnerLinks } = result
      const isNotTombstoned = (link) => (
        // filter links involving tombstoned profiles
        !rootGetters['person/isTombstoned'](link.child) && !rootGetters['person/isTombstoned'](link.parent)
      )

      return {
        childLinks: childLinks.filter(isNotTombstoned),
        partnerLinks: partnerLinks.filter(isNotTombstoned)
      }
    },
    async loadFamilyLinks ({ dispatch }, profileId) {
      const links = await dispatch('getFamilyLinks', { profileId })
      if (links) dispatch('addLinks', links)
    },
    async loadWhakapapaView ({ commit, dispatch, rootGetters, state }, id) {
      // set loadingwhakapapa:true here and false loading after we have setView
      state.loadingWhakapapa = true
      // If whakapapa had been opened, open previous view settings
      if (state.views[id]) return commit('setView', state.views[id])
      const view = await dispatch('getWhakapapaView', id)
      if (!view) {
        state.loadingWhakapapa = false
        return
      }
      // if no permission set then set as edit
      if (!view.permission) view.permission = 'edit'
      // set canEdit here instead of with graphql
      view.canEdit = rootGetters.isKaitiaki || view.permission === 'edit'
      const links = await dispatch('getDescendantLinks', view.focus)
      if (!links) return
      const isLoadingFocus = !state.views[id]
      commit('setView', view)
      dispatch('addLinks', { ...links, isLoadingFocus })
    },

    async saveWhakapapaView ({ commit, dispatch, rootGetters, state }, input) {
      const { id: whakapapaId } = input

      if (!whakapapaId) return // no update without an id

      const updateId = await apollo.niceMutation(dispatch, saveWhakapapaView(input))
      if (!updateId) return

      const view = await dispatch('getWhakapapaView', whakapapaId)
      view.canEdit = rootGetters.isKaitiaki || view.permission === 'edit'
      // if updating whakapapa while in whakapapa view
      if (state.view.id) commit('setView', view)
      // else if updating recordCount after leaving whakapapa view
      else state.views[view.id] = view

      return whakapapaId
    },
    setView ({ commit }, view) {
      commit('setView', view)
    },
    addProfileLocation ({ commit }, node) {
      commit('addProfileLocation', node)
    },
    async suggestedChildren ({ getters, dispatch }, parentId) {
      // TODO 2022-03-11 mix
      // change this to just use getters.getRawChildren
      // and then return just ids (map to profile in the view)

      const person = await dispatch('person/getPerson', parentId, { root: true })
      // TODO 2022-03-08 mix
      // deprecate getPerson use. Would could probably use the childLinks + partnerLinks to look around

      if (!person || !person.children) return []

      return uniqueId([
        ...flatMap(person, 'partners', 'children'),
        ...person.children // for ignored children
      ])
        .filter(profile => (
          // keep only children who aren't already a child of this profile
          !person.children.some(child => child.id === profile.id) ||
          // unless they're an ignored profile
          !getters.isNotIgnored(profile.id)
        ))
    },
    async suggestedParents ({ getters, dispatch }, childId) {
      const person = await dispatch('person/getPerson', childId, { root: true })
      // TODO 2022-03-08 mix
      // deprecate getPerson use. Would could probably use the childLinks + partnerLinks to look around
      const isRootNode = state.view.focus === person.id

      if (!person || !person.parents || !person.parents.length) return []

      return uniqueId([
        ...flatMap(person, 'siblings', 'parents'), // get all parents of siblings
        ...flatMap(person, 'parents', 'partners'), // get all partners of parents
        ...person.parents // for ignored parents
      ])
        .filter(profile => (
          // keep only parents who aren't already a parent of this profile
          !person.parents.some(parent => parent.id === profile.id) ||
          // unless they're an ignored profile
          !getters.isNotIgnored(profile.id)
        ))
        .concat(isRootNode ? person.parents : []) // handle existing parents if this is the root node
        // TODO 2022-03-08 mix
        // remove this concat once we check it's not needed...
    },

    ...importFromCsvActions,

    async createChildLink ({ dispatch }, input) {
      input.type = 'link/profile-profile/child'
      await dispatch('saveLink', input)
    },
    async createPartnerLink ({ dispatch }, input) {
      input.type = 'link/profile-profile/partner'
      await dispatch('saveLink', input)
    },
    async saveLink ({ dispatch }, input) {
      return apollo.niceMutation(dispatch, saveLink(input))
    },
    async deleteChildLink ({ commit, dispatch }, input) {
      const tombstoneId = await dispatch('deleteLink', input) // from db
      if (!tombstoneId) return

      await dispatch('deleteLinkFromImportantRelationships', input)
      commit('removeChildLink', input) // from state
    },

    async deletePartnerLink ({ commit, dispatch }, input) {
      input.isPartner = true
      const tombstoneId = await dispatch('deleteLink', input) // from db
      if (!tombstoneId) return

      await dispatch('deleteLinkFromImportantRelationships', input)
      commit('removePartnerLink', input) // from state
    },

    async deleteLink ({ dispatch }, { linkId, tombstone, parent, child, isPartner }) {
      if (!linkId) {
        const link = await dispatch('getLink', { parent, child, isPartner })
        if (!link) throw new Error('cannot delete link, unable to find it')
        linkId = link.linkId
      }

      return apollo.niceMutation(dispatch, saveLink({
        linkId,
        tombstone: tombstone || {
          date: new Date().toISOString().slice(0, 10),
          reason: 'user deleted'
        }
      }))
    },

    async getLink ({ dispatch }, input) { // input = { parent, child, isPartner }
      return apollo.niceQuery(dispatch, whakapapaLink(input))
    },

    async deleteLinkFromImportantRelationships ({ state, getters, dispatch }, link) {
      const { parent: A, child: B } = link

      const findRuleThatNeedsChange = (targetId, otherId) => {
        // find any rule about targetId
        const rule = getters.getImportantRelationship(targetId)
        if (!rule) return
        // throw out ones which don't mention otherId
        if (![rule.primary, ...rule.other].some(item => item.profileId === otherId)) return
        return rule
      }

      const ruleA = findRuleThatNeedsChange(A, B)
      if (ruleA) {
        await dispatch('saveWhakapapaView', {
          id: state.view.id,
          importantRelationships: {
            profileId: A,
            important: [ruleA.primary, ...ruleA.other]
              .map(r => r.profileId)
              .filter(profileId => profileId !== B)
          }
        })
      }

      const ruleB = findRuleThatNeedsChange(B, A)
      if (ruleB) {
        await dispatch('saveWhakapapaView', {
          id: state.view.id,
          importantRelationships: {
            profileId: B,
            important: [ruleB.primary, ...ruleB.other]
              .map(r => r.profileId)
              .filter(profileId => profileId !== A)
          }
        })
      }
    },
    async deleteProfileFromImportantRelationships ({ state, getters, dispatch }, profileId) {
      const rule = getters.getImportantRelationship(profileId)
      if (rule) {
        await dispatch('saveWhakapapaView', {
          id: state.view.id,
          importantRelationships: {
            profileId,
            important: []
          }
        })
      }

      // find rules which mention profileId
      await Promise.all(
        Object.values(state.view.importantRelationships)
          .map(async rule => {
            const important = [rule.primary, ...rule.other]
              .map(r => r.profileId)

            if (!important.includes(profileId)) return

            return dispatch('saveWhakapapaView', {
              id: state.view.id,
              importantRelationships: {
                profileId,
                important: important.filter(id => id !== profileId)
              }
            })
          // NOTE this may leave some importantRelationships with not enough "important" links
          // But the getImportantRelationship getter filters out rules which are not useful
          })
      )
    },

    setAutoCollapse ({ commit }, autoCollapse) {
      commit('setAutoCollapse', autoCollapse)
      if (!autoCollapse) commit('resetCollapsed')
    },
    getRecordCount ({ state, getters }) {
      const profiles = new Set([])
      const opts = { showCollapsed: true, showExtendedFamily: false }

      walkTree(state.childLinks, state.view.focus, (profileId) => {
        profiles.add(profileId)
        getters.getPartnerIds(profileId, opts).forEach(p => profiles.add(p))
        getters.getChildIds(profileId, opts).forEach(p => profiles.add(p))
      })

      return profiles.size
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

const removeRelationshipType = (person) => {
  if (person.relationshipType) person.relationshipType = null
  return person
}

/**
 * A helper function to flatten nested arrays within an array of objects.
 * E.g. to get a persons siblings parents use flatMap(person, 'siblings', 'parents')

 * @param {object} obj an object which holds the array
 * @param {string} array which field to look at on the given obj
 * @param {string} nestedArray which field to map objects in obj.array to
 */
function flatMap (obj, array, nestedArray) {
  if (!obj[array] || !obj[array].length) return []

  return obj[array]
    .flatMap(m => m[nestedArray]) // flattens from [[A, B], [C]] to [A, B, C]
    .map(removeRelationshipType)
}

function uniqueId (array) {
  return uniqby(array, 'id')
}

function walkTree (childLinks, start, fn) {
  // NOTE only walks childLinks
  // depth-first walk
  const queue = [[start, 0]]
  const processed = new Set()

  while (queue.length) {
    const [parentId, depth] = queue.shift()
    if (processed.has(parentId)) continue

    fn(parentId, depth, processed)

    for (const childId in childLinks[parentId]) {
      queue.push([childId, depth + 1])
    }

    processed.add(parentId)
  }
}

function shouldCollapseChildren (numberLoaded, depth, isLoadingFocus) {
  if (depth == null) return false

  if (depth === 0) return false
  if (depth > 0) {
    if (isLoadingFocus && numberLoaded < MIN_LOADED_PROFILES) return false
    return (depth % DEFAULT_DEPTH === 0)
  }
  if (depth < 0) {
    console.error('depth < 0 should not occur')
    return false
  }
}

function firstDefined (...args) {
  for (const arg of args) {
    if (arg === undefined) continue
    else return arg
  }
}
