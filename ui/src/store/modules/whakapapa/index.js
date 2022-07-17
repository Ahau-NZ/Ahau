/* eslint brace-style: ["error", "stroustrup", { "allowSingleLine": true }] */

import Vue from 'vue'
import uniqby from 'lodash.uniqby'

import { getWhakapapaView, getDescendantLinks, getWhakapapaViews, saveWhakapapaView, getFamilyLinks } from './lib/apollo-helpers'
import getExtendedFamily from './lib/get-extended-family'
import FindPathToRoot from './lib/find-path-to-root'

import { saveLink, whakapapaLink } from '../../../lib/link-helpers'
import { ACCESS_KAITIAKI } from '../../../lib/constants.js'

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
  autoCollapse: true,
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

    activeQueryCount: 0,

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
    autoCollapse: state => state.viewChanges.autoCollapse,
    isLoadingWhakapapa: state => state.activeQueryCount > 0,
    recordCount: (state, getters) => {
      const profiles = new Set([])
      const opts = { showCollapsed: true, showExtendedFamily: false }

      walkTree(state.childLinks, state.view.focus, (profileId, depth, processed) => {
        profiles.add(profileId)
        getters.getPartnerIds(profileId, opts).forEach(p => profiles.add(p))
        getters.getChildIds(profileId, opts).forEach(p => profiles.add(p))
      })

      return profiles.size
    },

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
      return Boolean(state.viewChanges.collapsed[id])
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
    addLinks (state, { childLinks = [], partnerLinks = [], isLoadingFocus = false }) {
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

      if (isLoadingFocus) {
        if (!state.view.focus) {
          console.error('expected state.view.focus to be set for auto-collapsing')
          return
        }
        walkTree(state.childLinks, state.view.focus, (profileId, depth, processed) => {
          if (shouldCollapseChildren(processed.size, depth, isLoadingFocus)) {
            // copy of setNodeCollapsed mutation
            Vue.set(state.viewChanges.collapsed, profileId, true)
          }
        })
      }
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
    },

    setAutoCollapse (state, autoCollapse) {
      state.viewChanges.autoCollapse = autoCollapse
    },
    resetCollapsed (state) {
      state.viewChanges.collapsed = {}
    }
  }

  const actions = {
    resetWhakapapaView ({ commit }) {
      commit('resetWhakapapaView')
    },
    async setViewFocus ({ commit, dispatch, getters }, id) {
      commit('setViewFocus', id)

      const links = await dispatch('getDescendantLinks', id)
      if (links) dispatch('addLinks', links)
    },
    toggleViewMode ({ commit, dispatch }) {
      commit('toggleViewMode')
    },
    async setExtendedFamily ({ commit }, extended) {
      commit('setExtendedFamily', extended)
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
    async getDescendantLinks (context, profileId) {
      try {
        const res = await apollo.query(getDescendantLinks(profileId))
        if (res.errors) throw new Error(res.errors)
        // TODO success alert message
        return res.data.getDescendantLinks
      }
      catch (err) {
        // TODO error alert message
        console.error('failed to get the descendant links', err)
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
    async getFamilyLinks ({ commit, rootGetters }, opts = {}) {
      const { profileId, extended = true } = opts

      commit('modifyActiveQueryCount', 1)
      try {
        const res = await apollo.query(getFamilyLinks(profileId, extended))
        if (res.errors) throw new Error(res.errors)

        const { childLinks, partnerLinks } = res.data.loadFamilyOfPerson
        const isNotTombstoned = (link) => (
          // filter links involving tombstoned profiles
          !rootGetters['person/isTombstoned'](link.child) && !rootGetters['person/isTombstoned'](link.parent)
        )

        commit('modifyActiveQueryCount', -1)
        return {
          childLinks: childLinks.filter(isNotTombstoned),
          partnerLinks: partnerLinks.filter(isNotTombstoned)
        }
      }
      catch (err) {
        console.error('error getting family links', err)
        // TODO error alert message
        commit('modifyActiveQueryCount', -1)
        return { childLinks: [], partnerLinks: [] }
      }
    },
    async loadFamilyLinks ({ dispatch }, profileId) {
      const links = await dispatch('getFamilyLinks', { profileId })
      if (links) dispatch('addLinks', links)
    },
    async loadWhakapapaView ({ commit, dispatch }, id) {
      commit('resetWhakapapaView')
      const view = await dispatch('getWhakapapaView', id)
      if (!view) return

      commit('setView', view)
      const links = await dispatch('getDescendantLinks', view.focus)
      if (!links) return
      dispatch('addLinks', { ...links, isLoadingFocus: true })
    },

    async saveWhakapapaView ({ commit, dispatch }, input) {
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

    // create a whakapapa from rows containing a profile + link
    async bulkCreateWhakapapaView ({ dispatch }, { whakapapaViewInput, rows, type }) {
      dispatch('setLoading', true, { root: true })
      dispatch('setLoadingLabel', 'importing CSV...', { root: true })

      const { recps } = whakapapaViewInput
      if (!recps) throw new Error('no recps found on the import input!')

      const length = rows.length
      const totalProfiles = {}
      const totalLinks = []
      const chunkSize = 100

      for (let i = 0; i < length; i += chunkSize) {
        // show progress percentage
        const percentage = Math.round((Object.keys(totalProfiles).length / length * 100) * 10) / 10 || true
        dispatch('setLoading', percentage, { root: true })
        dispatch('setLoadingLabel', 'creating profiles...', { root: true })
        // split out 100 profiles
        const chunk = rows.slice(i, i + chunkSize)
        // create profiles
        const { profiles, links } = await dispatch('bulkCreateProfiles', { chunk, recps })
        // add profiles to total obj
        Object.assign(totalProfiles, profiles)
        // add links to total links arr
        if (links) totalLinks.push(...links)
      }

      if (totalLinks.length) {
        // show progress percentage
        dispatch('setLoading', true, { root: true })
        dispatch('setLoadingLabel', 'adding family links...', { root: true })

        for (let i = 0; i < length; i += chunkSize) {
          // show progress percentage
          const percentage = Math.round((i / totalLinks.length * 100) * 10) / 10 || true
          dispatch('setLoading', percentage, { root: true })
          // split 100 links
          const linksChunk = totalLinks.slice(i, i + chunkSize)
          // create links
          await dispatch('bulkCreateLinks', { linksChunk, totalProfiles, recps })
        }
      }

      // if from create whakapapa
      if (!type) {
        // the first row is the focus
        whakapapaViewInput.focus = totalProfiles[rows[0].csvId]
        // create whakapapa with first person in the csv as the focus
        return dispatch('createWhakapapaView', whakapapaViewInput) // whakapapaId
      }
      else {
        return totalProfiles
      }
    },
    async bulkCreateProfiles ({ dispatch, rootGetters }, { chunk, recps }) {
      const profiles = {}
      const links = chunk
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
        chunk.map(async ({ csvId, profile }, i) => {
          if (!profile) return

          profile.recps = recps
          profile.type = rootGetters.currentAccess.type === ACCESS_KAITIAKI ? 'person/admin' : 'person'
          profile.authors = {
            add: ['*']
          }
          const profileId = await dispatch('person/createPerson', profile, { root: true })

          // importing from peoples list doesnt require a csvId we may not be building relaiotnships
          if (csvId) profiles[csvId] = profileId
          else profiles[i] = profileId
        })
      )
        .catch((err) => {
          console.error('failed to create profile with csv bulk create', err)
          dispatch('setLoading', false, { root: true })
        })

      if (!res) return

      return { profiles, links }
    },
    async bulkCreateLinks ({ dispatch }, { recps, linksChunk, totalProfiles }) {
      await Promise.all(
        linksChunk.map((link, i) => {
          const { parentCsvId, childCsvId, relationshipType } = link

          const relationship = {
            // get the parent and child's actual profileId
            parent: totalProfiles[parentCsvId],
            child: totalProfiles[childCsvId],
            recps
          }

          if (relationshipType === 'partner') return dispatch('createPartnerLink', relationship)

          // // TODO: check if this is important
          if (relationshipType !== '' && relationshipType !== null) relationship.relationshipType = relationshipType

          return dispatch('createChildLink', relationship)
        })
      )
    },
    async createChildLink ({ dispatch }, input) {
      input.type = 'link/profile-profile/child'
      await dispatch('saveLink', input)
    },
    async createPartnerLink ({ dispatch }, input) {
      input.type = 'link/profile-profile/partner'
      await dispatch('saveLink', input)
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
        Object.values(state.view.importantRelationships).map(async rule => {
          const important = [rule.primary, ...rule.other].map(r => r.profileId)
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
