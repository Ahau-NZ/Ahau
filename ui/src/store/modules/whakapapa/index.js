/* eslint brace-style: ["error", "stroustrup", { "allowSingleLine": true }] */

import Vue from 'vue'
import uniqby from 'lodash.uniqby'

import { getWhakapapaView, getWhakapapaViews, saveWhakapapaView, getFamilyLinks } from './lib/apollo-helpers'
import getExtendedFamily from './lib/get-extended-family'

import { saveLink, whakapapaLink } from '../../../lib/link-helpers'
import { ACCESS_KAITIAKI } from '../../../lib/constants.js'

const DEFAULT_DEPTH = 2
// minimum number of generations to load before hiding further children (see loadDescendants)
const MIN_LOADED_PROFILES = 10
// minimum number of profiles to initially aim to load
// this helps take into account graphs which start out line a long line before spreading out

// NOTE: the app assumes that the default childLink relationshipType is birth
// when some are saved as null, it sets them to birth by default so
// the graph displays these links correctly
const FALLBACK_CHILD_REL = 'birth'
const FALLBACK_PARTNER_REL = 'partners'

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
  table: false
})

const defaultViewChanges = () => ({
  focus: null, // can temporarily over-ride the saved view.focus
  collapsed: { // maps node.data.id to Boolean (default false)
  },
  showExtendedFamily: false
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
    lastWhakapapaView: state => state.lastView,
    focus: state => state.viewChanges.focus || state.view.focus,
    ignoredProfileIds: state => state.view.ignoredProfiles,
    showExtendedFamily: state => Boolean(state.viewChanges.showExtendedFamily),
    recordCount: (state, getters) => {
      const queue = [state.view.focus]
      const profiles = new Set([])

      while (queue.length) {
        const rootNodeId = queue.shift()

        profiles.add(rootNodeId)

        getters.getPartnerIds(rootNodeId, { showCollapsed: true, showExtendedFamily: false })
          .forEach(partnerId => profiles.add(partnerId))

        getters.getChildIds(rootNodeId, { showCollapsed: true, showExtendedFamily: false })
          .forEach(childId => profiles.add(childId) && queue.push(childId))
      }

      return profiles.size
    },

    /* getter methods */
    isCollapsedNode: state => (id) => Boolean(state.viewChanges.collapsed[id]),
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
          .forEach(childId => queue.push(childId))
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
      else {
        return getters.getRawChildIds(parentId)
          .filter(getters.isNotIgnored)
          .filter(childId => getters.isImportantLink(childId, parentId))
      }
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

      return {
        id: parentId,
        children: getters.getChildIds(parentId)
          .filter(childId => !lineage.has(childId)) // never recurse into a parent already seen
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
              relationshipType: getters.getChildType(parentId, ruleTarget)
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
    setExtendedFamily (state, bool = false) {
      state.viewChanges.showExtendedFamily = bool
    },
    setNodeCollapsed (state, { nodeId, isCollapsed }) {
      Vue.set(state.viewChanges.collapsed, nodeId, isCollapsed)
    },
    resetWhakapapaView (state) {
      state.lastView = state.view
      state.view = defaultView()
      state.viewChanges = defaultViewChanges()

      // NOTE 2022-03-07 mix
      // wiping all links slows down graph reload, but not by much with depth-limited loading
      // ALT idea:
      // give Node.vue node.depth, then have a mounted hook or similar collapse the node if needed
      state.childLinks = {}
      state.partnerLinks = {}
    },

    // methods for manipulating whakapapa links
    addLinks (state, { childLinks = [], partnerLinks = [] }) {
      // NOTE we do a bulk mutation because this reduces the number of updates
      // in the state = less thrashing
      childLinks.forEach(({ parent, child, relationshipType }) => {
        const newChildren = {
          ...(state.childLinks[parent] || {}),
          [child]: relationshipType || FALLBACK_CHILD_REL
        }

        Vue.set(state.childLinks, parent, newChildren)
      })

      partnerLinks.forEach(({ parent, child, relationshipType }) => {
        const [partnerA, partnerB] = [parent, child].sort()
        const newPartners = {
          ...(state.partnerLinks[partnerA] || {}),
          [partnerB]: relationshipType || FALLBACK_PARTNER_REL
        }

        Vue.set(state.partnerLinks, partnerA, newPartners)
      })
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
    }
  }

  const actions = {
    resetWhakapapaView ({ commit }) {
      commit('resetWhakapapaView')
    },
    setViewFocus ({ commit, dispatch, getters }, id) {
      commit('setViewFocus', id)
      dispatch('loadDescendants', getters.focus)
    },
    toggleViewMode ({ commit, dispatch }) {
      commit('toggleViewMode')
    },
    async setExtendedFamily ({ state, commit, dispatch, getters }, extended) {
      const id = state.view.id
      commit('resetWhakapapaView')
      commit('setExtendedFamily', extended)
      const view = await dispatch('getWhakapapaView', id)
      if (view) {
        dispatch('setView', view)
        dispatch('loadDescendants', { profileId: view.focus, depth: DEFAULT_DEPTH })
      }
    },
    toggleNodeCollapse ({ state, commit }, nodeId) {
      commit('setNodeCollapsed', {
        nodeId,
        isCollapsed: !state.viewChanges.collapsed[nodeId]
      })
    },
    addLinks ({ commit }, links) {
      commit('addLinks', links)
    },
    removeLinksToProfile ({ state, commit }, profileId) {
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
      }
      catch (err) {
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
      }
      catch (err) {
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
      }
      catch (err) {
        console.error('error getting family links', err)
        // TODO error alert message
        return { childLinks: [], partnerLinks: [] }
      }
    },
    async loadWhakapapaView ({ commit, dispatch }, id) {
      commit('resetWhakapapaView')
      const view = await dispatch('getWhakapapaView', id)
      if (view) {
        dispatch('setView', view)
        dispatch('loadDescendants', { profileId: view.focus, depth: DEFAULT_DEPTH })
      }
    },
    async loadDescendants ({ state, dispatch, commit, getters, rootGetters }, opts) {
      if (!opts) return
      if (typeof opts === 'string') return dispatch('loadDescendants', { profileId: opts })

      const {
        profileId,
        isLoadingFocus = opts.profileId === getters.focus, // if this load orginates from the focus
        depth: lastDepth, // how many more generations we want to display. Can be empty
        loaded = new Set() // which profiles we've already loaded/ processed
      } = opts
      if (!profileId || loaded.has(profileId)) return

      const depth = (lastDepth != null) ? lastDepth - 1 : null
      loaded.add(profileId)

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

      // TODO 2022-03-07 mix - move this into table/Node.vue I think
      if (getters.isTable) {
        // load a persons profile into state if we are looking at the table
        dispatch('person/loadPersonFull', profileId, { root: true })
        // get all the partners profiles
        partnerLinks.forEach(link => {
          const partnerId = link.child === profileId ? link.parent : link.child
          dispatch('person/loadPersonMinimal', partnerId, { root: true })
        })
      }

      const childIds = childLinks
        // keep links which from the profileId down to a child
        .filter(link => link.parent === profileId && link.child !== profileId)
        // keep links which are importantRelationship links (or not mentioned in a rule)
        .filter(link => getters.isImportantLink(link.child, profileId))
        .map(link => link.child)

      // dont collapse a node who doesnt have descendants and partners
      if (!childIds.length && !partnerLinks.length) commit('setNodeCollapsed', { nodeId: profileId, isCollapsed: false })

      if (shouldCollapseChildren(loaded, depth, isLoadingFocus)) {
        childIds.forEach(childId => {
          commit('setNodeCollapsed', { nodeId: childId, isCollapsed: true })
        })
      }

      commit('addLinks', { childLinks, partnerLinks })

      // recurse through children
      childIds.forEach(childId => {
        dispatch('loadDescendants', { profileId: childId, isLoadingFocus, depth, loaded })
      })
    },
    async saveWhakapapaView ({ state, commit, dispatch }, input) {
      if (!input.id) input.id = state.view.id
      try {
        const res = await apollo.mutate(saveWhakapapaView(input))

        if (res.errors) throw new Error(res.errors)

        const view = await dispatch('getWhakapapaView', res.data.saveWhakapapaView)
        if (view) commit('setView', view)

        return res.data.saveWhakapapaView
      }
      catch (err) {
        console.error('failed to save the whakapapa', err)
      }
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

      if (!person || !person.children || !person.children.length) return []

      return uniqueId([
        ...flatMap(person, 'partners', 'children'), // get all children of partners
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
      input.type = 'link/profile-profile/partner'
      await dispatch('createLink', input)
    },
    async saveLink (context, input) {
      try {
        const res = await apollo.mutate(saveLink(input))
        if (res.errors) throw res.errors

        return res.data.saveLink
      }
      catch (err) {
        console.log('failed to create link', input)
        console.log(err)
      }
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
      try {
        if (!linkId) {
          const link = await dispatch('getLink', { parent, child, isPartner })
          if (!link) throw new Error('cannot delete link, unable to find it')
          linkId = link.linkId
        }

        const res = await apollo.mutate(saveLink({
          linkId,
          tombstone: tombstone || {
            date: new Date().toISOString().slice(0, 10),
            reason: 'user deleted'
          }
        }))
        if (res.errors) throw res.errors

        return res.data.saveLink
      }
      catch (err) {
        console.log('failed to delete link', { linkId, parent, child, tombstone, isPartner })
        console.log(err)
      }
    },

    async getLink (context, input) { // input = { parent, child, isPartner }
      try {
        const res = await apollo.query(whakapapaLink(input))
        if (res.errors) throw res.errors

        return res.data.whakapapaLink
      }
      catch (err) {
        console.log('failed to find link', input)
        console.log(err)
      }
    },

    async deleteLinkFromImportantRelationships ({ getters, dispatch }, link) {
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
          importantRelationships: {
            profileId,
            important: []
          }
        })
      }

      // find rules which mention profileId
      await Promise.all(
        Object.values(state.view.importantRelationships).map(async rule => {
          const important = [rule.primary, ...rule.other].map(r => r.profileId)
          if (!important.includes(profileId)) return

          return dispatch('saveWhakapapaView', {
            importantRelationships: {
              profileId,
              important: important.filter(id => id !== profileId)
            }
          })
          // NOTE this may leave some importantRelationships with not enough "important" links
          // But the getImportantRelationship getter filters out rules which are not useful
        })
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
 * E.g. to get a persons siblings parents use flatMap(person, 'siblings', 'parents')

 * @param {object} obj an object which holds the array
 * @param {string} array which field to look at on the given obj
 * @param {string} nestedArray which field to map objects in obj.array to
 */
function flatMap (obj, array, nestedArray) {
  if (!obj[array] || !obj[array].length) return []

  return obj[array]
    .flatMap(m => m[nestedArray]) // flattens from [[A, B], [C]] to [A, B, C]
}

function uniqueId (array) {
  return uniqby(array, 'id')
}

function shouldCollapseChildren (loaded, depth, isLoadingFocus) {
  if (depth === null) return false

  if (depth > 0) return false
  if (depth === 0) {
    // when depth is 0, we have used up all or generation-hops,
    // so we pre-emptively continue loading links, but collapse the next children
    // so that the graph drawing is bounded
    if (isLoadingFocus && loaded.size < MIN_LOADED_PROFILES) return false
    // we may want to load more to account for some graphs starting out like a line
    else return true
  }
  if (depth < 0) {
    if (isLoadingFocus && loaded.size < MIN_LOADED_PROFILES) return false
    return (depth % DEFAULT_DEPTH === 0)
  }
  // beyond our initial goal, we collapse every DEFAULT_DEPTH'd generation, so that when you expand (uncollapse)
  // a node, only another DEFAULT_DEPTH generations are displayed
}

function firstDefined (...args) {
  for (const arg of args) {
    if (arg === undefined) continue
    else return arg
  }
}
