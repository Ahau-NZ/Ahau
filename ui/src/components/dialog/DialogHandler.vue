<template>
  <div id="container">
    <ReviewRegistrationDialog
      v-if="isActive('review-registration')"
      :show="isActive('review-registration')"
      :title="t('reviewRegistrationTitle', {groupPreferredName: currentNotification.group.preferredName})"
      :notification="currentNotification"
      @close="close"
    />
    <NewCommunityDialog
      v-if="isActive('new-community')"
      :show="isActive('new-community')"
      :title="t('createCommunityTitle')"
      @submit="setupNewCommunity($event)"
      @close="close"
    />
    <NewNodeDialog
      v-if="isActive('new-node')"
      :show="isActive('new-node')"
      :title="t('newNodeTitle', {dialogType, displayName: getDisplayName(selectedProfile)})"
      :selectedProfile="selectedProfile"
      :suggestions="suggestions"
      :type="dialogType"
      :findInTree="findInTree"
      withView
      @getSuggestions="getSuggestions($event)"
      @create="addPerson($event)"
      @close="close"
    />
    <!-- TODO: this doesnt appear to be used by anything here! -->
    <EditNodeDialog
      v-if="isActive('edit-node')"
      :show="isActive('edit-node')"
      :title="t('editNodeTitle', {displayName: getDisplayName(selectedProfile)})"
      @submit="processUpdate($event)"
      @close="close"
      :nodeProfile="profile"
    />
    <SideNodeDialog
      v-if="isActive('view-edit-node')"
      :show="isActive('view-edit-node')"
      :profileId="selectedProfile.id"
      :deleteable="canDelete(selectedProfile)"
      @close="close"
      @new="toggleDialog('new-node', $event, 'view-edit-node')"
      @submit="processUpdate($event)"
      @delete="toggleDialog('delete-node', null, null)"
      @open-profile="setSelectedProfile($event)"
      @delete-link="removeLinkFromTree"
      @reload-whakapapa="reloadWhakapapa"
      :view="view"
      :preview="previewProfile"
    />
    <DeleteNodeDialog
      v-if="isActive('delete-node')"
      :show="isActive('delete-node')"
      :profile="selectedProfile"
      :warnAboutChildren="selectedProfile && selectedProfile.id !== nestedWhakapapa.id"
      @submit="removeProfile"
      @close="close"
    />
    <WhakapapaViewDialog
      v-if="isActive('whakapapa-view')"
      :show="isActive('whakapapa-view')"
      :view="view"
      @edit="toggleDialog('whakapapa-edit', null, 'whakapapa-view')"
      @close="close"
    />
    <WhakapapaEditDialog
      v-if="isActive('whakapapa-edit')"
      :show="isActive('whakapapa-edit')"
      :view="view"
      @delete="toggleDialog('whakapapa-delete', null, 'whakapapa-edit')"
      @close="close"
      @submit="$emit('update-whakapapa', $event)"
    />
    <WhakapapaDeleteDialog
      v-if="isActive('whakapapa-delete')"
      :show="isActive('whakapapa-delete')"
      :view="view"
      @close="close"
      @submit="$emit('delete-whakapapa')"
    />
    <WhakapapaShowHelper
      v-if="isActive('whakapapa-helper')"
      :show="isActive('whakapapa-helper')"
      :title="t('whakapapaShowHelperTitle')"
      @close="close"
    />
    <WhakapapaTableHelper
      v-if="isActive('whakapapa-table-helper')"
      :show="isActive('whakapapa-table-helper')"
      :title="t('whakapapaRegistryTitle')"
      @close="close"
    />
    <ComingSoonDialog :show="isActive('coming-soon')" @close="close" />
  </div>
</template>

<script>
import pick from 'lodash.pick'
import * as d3 from 'd3'

import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import NewCommunityDialog from '@/components/dialog/community/NewCommunityDialog.vue'
import EditNodeDialog from '@/components/dialog/profile/EditNodeDialog.vue'
import SideNodeDialog from '@/components/dialog/profile/SideNodeDialog.vue'
import DeleteNodeDialog from '@/components/dialog/profile/DeleteNodeDialog.vue'
import WhakapapaViewDialog from '@/components/dialog/whakapapa/WhakapapaViewDialog.vue'
import WhakapapaEditDialog from '@/components/dialog/whakapapa/WhakapapaEditDialog.vue'
import WhakapapaDeleteDialog from '@/components/dialog/whakapapa/WhakapapaDeleteDialog.vue'
import WhakapapaShowHelper from '@/components/dialog/whakapapa/WhakapapaShowHelper.vue'
import WhakapapaTableHelper from '@/components/dialog/whakapapa/WhakapapaTableHelper.vue'
import ComingSoonDialog from '@/components/dialog/ComingSoonDialog.vue'
import ReviewRegistrationDialog from '@/components/dialog/registration/ReviewRegistrationDialog.vue'

import { getDisplayName } from '@/lib/person-helpers.js'
import { findByName } from '@/lib/search-helpers.js'

import findSuccessor from '@/lib/find-successor'

import mapProfileMixins from '@/mixins/profile-mixins.js'
import { ACCESS_KAITIAKI } from '@/lib/constants.js'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'DialogHandler',
  components: {
    NewNodeDialog,
    EditNodeDialog,
    SideNodeDialog,
    DeleteNodeDialog,
    WhakapapaViewDialog,
    WhakapapaEditDialog,
    WhakapapaDeleteDialog,
    WhakapapaShowHelper,
    WhakapapaTableHelper,
    ComingSoonDialog,
    NewCommunityDialog,
    ReviewRegistrationDialog
  },
  props: {
    story: {
      type: Object
    },
    focus: {
      type: String
    },
    view: {
      type: Object, default: null
    },
    dialog: {
      type: String,
      required: false,
      default: null,
      validator: (val) => [
        'new-community', 'new-node', 'view-edit-node', 'delete-node', 'new-story', 'edit-story', 'edit-node', 'delete-story',
        'whakapapa-view', 'whakapapa-edit', 'whakapapa-delete', 'whakapapa-helper', 'whakapapa-table-helper', 'review-registration', 'table-filter-menu'
      ].includes(val)
    },
    type: {
      type: String,
      default: null,
      validator: (val) => [
        'parent', 'child', 'sibling', 'partner'
      ].includes(val)
    },
    loadDescendants: Function,
    loadKnownFamily: Function,
    setSelectedProfile: Function,
    getRelatives: Function
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile', 'tribe'],
      mapMethods: ['saveLink', 'getWhakapapaLink']
    })
  ],
  data () {
    return {
      suggestions: [],
      source: null,
      registration: '',
      dialogType: '',
      parents: [],
      parentIndex: null,
      profile: {},
      tribe: {},
      predecessorArray: []
    }
  },
  computed: {
    ...mapGetters('person', ['selectedProfile']),
    ...mapGetters(['whoami', 'storeDialog', 'storeType', 'currentNotification', 'currentAccess']),
    ...mapGetters('whakapapa', ['getParentNodeId', 'nestedWhakapapa']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    previewProfile () {
      return this.storeType === 'preview'
    },
    dialogOpen () {
      return (this.dialog || this.storeDialog)
    }
  },
  watch: {
    type (newVal) {
      this.dialogType = newVal
    },
    storeType (newVal) {
      this.dialogType = newVal
    },
    dialogOpen (newVal) {
      // TODO consider using vuex action for this
      if (newVal === true) {
        document.body.classList.add('stop-scroll')
      } else {
        document.body.classList.remove('stop-scroll')
      }
    }
  },
  methods: {
    getDisplayName,
    ...mapActions('profile', ['getProfile']),
    ...mapActions('person', ['createPerson', 'loadPersonMinimal', 'updatePerson', 'deletePerson']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('tribe', ['initGroup']),
    ...mapActions(['loading', 'setDialog']),
    ...mapActions('whakapapa', [
      'saveWhakapapaView',
      'getWhakapapaView',
      'updateNodeInNestedWhakapapa',
      'deleteNodeInNestedWhakapapa',
      'setNestedWhakapapa',
      'setView'
    ]),
    isActive (type) {
      if (type === this.dialog || type === this.storeDialog) {
        return true
      }
      return false
    },
    close () {
      if (this.isActive('new-node')) {
        this.toggleDialog(this.source, this.dialogType, null)
        return
      }

      if (this.isActive('table-filter-menu')) this.$emit('toggleFilterMenu')

      this.toggleDialog(this.source, null, null)
      this.$emit('setloading', false)
    },
    toggleDialog (dialog, type, source) {
      this.source = source
      if (this.storeDialog) {
        this.setDialog(dialog, type, source)
        return
      }
      this.$emit('update:dialog', dialog)
      this.$emit('update:type', type)
    },
    canDelete (profile) {
      // TODO refactor this logic + WhakapapaShow logic
      if (!profile) return false
      if (this.previewProfile) return false

      // not allowed to delete own profile
      if (profile.id === this.whoami.public.profile.id) return false
      if (profile.id === this.whoami.personal.profile.id) return false

      // if deleting the focus (top ancestor)
      if (this.view && profile.id === this.view.focus) {
        // can only proceed if can find a clear "successor" to be new focus
        return Boolean(findSuccessor(profile))
      }
      return true
    },
    async setupNewCommunity (input) {
      try {
        const group = await this.initGroup(input)

        this.$router.push({ name: 'community/profile', params: { tribeId: group.id, profileId: group.private[0].id } }).catch(() => {})
      } catch (err) {
        console.error('Something went wrong while trying to create private group', input)
        console.error(err)
        this.showAlert({
          message: 'Failed to create the private group. Please contact us if this continues to happen',
          delay: 5000,
          color: 'red'
        })
      }
    },
    async addPerson (input) {
      // if moveDup is in input than add duplink
      if (input.hasOwnProperty('moveDup')) {
        await this.addImportantRelationship(input)
        delete input.moveDup
      }

      // get children, parents, partners quick add links
      var { id, children, parents, partners } = input

      // remove them from input
      delete input.children
      delete input.parents
      delete input.partners

      id = await this.createNewPerson(input)

      const ignored = await this.removeIgnoredProfile(id)

      const relationshipAttrs = pick(input, [
        'relationshipType',
        'legallyAdopted'
      ])

      switch (this.dialogType) {
        case 'child':
        case 'sibling':
          let child = id
          const parentProfileId = this.dialogType === 'child'
            ? this.selectedProfile.id
            : this.getParentNodeId(this.selectedProfile.id)

          if (!parentProfileId) {
            console.error(`Missing the parent profile when add a ${this.dialogType}`)
            return
          }

          if (!ignored) {
            // create the link
            await this.createChildLink({
              child,
              parent: parentProfileId,
              relationshipAttrs
            })
          }

          // Add parents if parent quick links
          if (parents) await this.quickAddParents(id, parents)

          // load the childs profile
          const parentProfile = await this.loadDescendants(parentProfileId)
          // NOTE this is a profile decorated with children etc!

          // add the child to the parent in the nested whakapapa
          this.updateNodeInNestedWhakapapa(parentProfile)

          break

        case 'parent':
          child = this.selectedProfile.id
          var parent = id

          if (!ignored) {
            await this.createChildLink({
              child,
              parent,
              relationshipAttrs
            })
          }

          // Add parents if partner quick add links
          if (partners) {
            await Promise.all(partners.map(async partner => {
              await this.createPartnerLink({
                child: id,
                parent: partner.id
              })
            }))
          }

          // Add children if children quick add links
          if (children) await this.quickAddChildren(id, children)

          if (child === this.view.focus) {
            this.$emit('updateFocus', parent)
          } else {
            const hasParentNodeId = this.getParentNodeId(child)
            if (hasParentNodeId) { // when a node already has a parent node above them, this will be called
              const parentProfile = await this.loadDescendants(hasParentNodeId)
              // NOTE we're not passing in a "seen" variable, so this call might result in infinite loops
              this.updateNodeInNestedWhakapapa(parentProfile)

              // so you wont see the extra parent update
            } else {
              // when the child doesnt have a parent above them, this will be called
              // load the new parents profile
              const parentProfile = await this.loadDescendants(parent)
              this.$emit('change-focus', parentProfile.id)
            }
          }
          break
        case 'partner':
          parent = this.selectedProfile.id
          child = id

          // create the link
          if (!ignored) {
            await this.createPartnerLink({
              parent,
              child
            })
          }

          // Add children if children quick add links
          if (children) await this.quickAddChildren(id, children)

          await this.loadDescendants(this.selectedProfile.id)
          this.updateNodeInNestedWhakapapa(this.selectedProfile)
          break
        default:
          console.error('wrong type for add person')
      }
    },
    async quickAddParents (child, parents) {
      await Promise.all(
        parents.map(async parent => {
          // check if a link already exists
          const link = await this.getWhakapapaLink(parent.id, child)
          if (link) return

          const relationshipAttrs = pick(parent, ['relationshipType', 'legallyAdopted'])
          await this.createChildLink({ child, parent: parent.id, relationshipAttrs })
        })
      )
    },
    async quickAddChildren (parent, children) {
      await Promise.all(
        children.map(async child => {
          // check if a link already exists
          const link = await this.getWhakapapaLink(parent, child.id)
          if (link) return

          const relationshipAttrs = pick(child, ['relationshipType', 'legallyAdopted'])
          await this.createChildLink({ child: child.id, parent, relationshipAttrs })
        })
      )
    },

    async createNewPerson (input) {
      // if there is an id, we dont need to create, just return the id
      if (input.id) return input.id

      // setup new profile required fields
      input.type = this.currentAccess.type === ACCESS_KAITIAKI ? 'person/admin' : 'person'
      input.authors = {
        add: [
          input.recps.includes(this.whoami.personal.groupId) // if its my personal group
            ? this.whoami.public.feedId // encrypt to my feedId
            : '*' // otherwise allow all authors
        ]
      }

      // create the person and return their id
      return this.createPerson(input)
    },

    async removeIgnoredProfile (id) {
      if (!this.view.ignoredProfiles.includes(id)) return false

      const input = {
        id: this.$route.params.whakapapaId,
        ignoredProfiles: {
          remove: [id]
        }
      }

      await this.saveWhakapapaView(input)
      await this.$parent.reload()

      return true
    },

    async createChildLink ({ child, parent, relationshipAttrs }) {
      await this.saveLink({
        type: 'link/profile-profile/child',
        child,
        parent,
        recps: this.view.recps,
        ...relationshipAttrs
      })
    },
    async createPartnerLink (input) {
      input.type = 'link/profile-profile/partner'
      input.recps = this.view.recps

      await this.saveLink(input)
    },
    async processUpdate (input) {
      if (input.recps) delete input.recps

      const profileId = this.selectedProfile.id
      // update their profile in the db
      await this.updatePerson({ id: profileId, ...input })

      // loads their minimal profile for changes in the tree
      await this.loadPersonMinimal(profileId)
    },
    async removeProfile (deleteOrIgnore) {
      await this.removeProfileFromImportantRelationships(this.selectedProfile.id)
      if (deleteOrIgnore === 'delete') {
        await this.processDeletePerson()
      } else {
        await this.ignoreProfile()
      }
    },
    async removeLinkFromTree ({ link, mainProfileId }) {
      const removedImportantRelationship = await this.checkAndUpdateImportantRelationships(link.parent, link.child)

      // we want to remove the person from the selectedProfile in the tree
      if (removedImportantRelationship) await this.reloadWhakapapa() // WARNING: this can get expensive for a larger tree
      else {
        if (mainProfileId) this.deleteNodeInNestedWhakapapa({ id: mainProfileId })
        else await this.reloadWhakapapa()
      }

      this.setSelectedProfile(this.selectedProfile)
    },

    // TODO 25-11-2021 cherese move these methods to ssb-graphql-whakapapa
    async removeProfileFromImportantRelationships (profileId) {
      // find rule for profileId
      const rule = this.view.importantRelationships.find(rule => rule.profileId === profileId)
      if (rule) {
        await this.saveWhakapapaView({
          id: this.$route.params.whakapapaId,
          importantRelationships: {
            profileId,
            important: []
          }
        })
      }

      // find rules which mention profileId
      await Promise.all(
        this.view.importantRelationships.map(async rule => {
          const important = [rule.primary.profileId, ...rule.other.map(r => r.profileId)]
          if (important.includes(profileId)) {
            return this.saveWhakapapaView({
              id: this.$route.params.whakapapaId,
              importantRelationships: {
                profileId,
                important: important.filter(id => id !== profileId)
              }
            })
          }
        })
      )
    },
    async checkAndUpdateImportantRelationships (profileIdA, profileIdB) {
      /*
        rule = {
          profileId,
          primary: { profileId, relationshipType },
          other: [
            { profileId, relationshipType }
          ]
        }

        // find the rules which are about profileA
        // see if they mention profileB
        // -> could be a primary
        // -> could be in other
        // IF its in either, we need to set a new rule
      */

      const findImportantRelationship = (profileId, otherProfileId) => {
        return this.view.importantRelationships.find(rule => {
          return (
            (rule.profileId === profileId) && // A
            (
              rule.primary.profileId === otherProfileId || // B
              rule.other.some(r => r.profileId === otherProfileId) // C
            )
          )
        })
      }

      let didUpdate = false
      const ruleA = findImportantRelationship(profileIdA, profileIdB)
      if (ruleA) {
        didUpdate = true
        await this.saveWhakapapaView({
          id: this.$route.params.whakapapaId,
          importantRelationships: {
            profileId: profileIdA,
            important: [
              ruleA.primary.profileId,
              ...ruleA.other.map(r => r.profileId)
            ]
              .filter(profileId => profileId !== profileIdB)
          }
        })
      }

      const ruleB = findImportantRelationship(profileIdB, profileIdA)
      if (ruleB) {
        didUpdate = true
        await this.saveWhakapapaView({
          id: this.$route.params.whakapapaId,
          importantRelationships: {
            profileId: profileIdB,
            important: [
              ruleB.primary.profileId,
              ...ruleB.other.map(r => r.profileId)
            ]
              .filter(profileId => profileId !== profileIdA)
          }
        })
      }

      return didUpdate
    },
    async addImportantRelationship (input) {
      // Check if we are moving a partner connection
      var profile = (input.moveDup || this.dialogType === 'child') ? input : this.selectedProfile

      // check if there is already an existing important relationship
      const exsistingDupe = this.view.importantRelationships.find(dupe => dupe.profileId === profile.id)
      var lessRelationship

      if (exsistingDupe) {
        // YES - there is an important relationship so we use that one instead
        lessRelationship = exsistingDupe.primary.profileId
      } else {
        // NO - there isnt an important relationship so we find the parent which takes "presidence"
        lessRelationship = (profile.parents && profile.parents.length && this.findInTree(profile.parents[0].id))
          ? profile.parents[0].id // take the first parent
          : profile.partners && profile.partners.length
            ? profile.partners[0].id // otherwise take the first partner? TODO: is this logic right @ben? Need to check!
            : null

        if (!lessRelationship) return
      }

      var importantRelationship = {
        profileId: profile.id
      }

      // check if we are linking a partner connection
      if (input.moveDup || this.dialogType === 'child') {
        importantRelationship.important = (input.moveDup)
          ? [this.selectedProfile.id, lessRelationship]
          : [lessRelationship, this.selectedProfile.id]
      } else if (input.moveDup === false && this.dialogType === 'parent') {
        importantRelationship.important = [lessRelationship, input.id]
      } else {
        importantRelationship.important = [input.id, lessRelationship]
      }

      const update = {
        id: this.$route.params.whakapapaId,
        importantRelationships: importantRelationship
      }

      await this.saveWhakapapaView(update)
      await this.$parent.reload()
    },
    // END TODO

    async ignoreProfile () {
      const input = {
        id: this.$route.params.whakapapaId,
        ignoredProfiles: {
          add: [this.selectedProfile.id]
        }
      }

      await this.saveWhakapapaView(input)
      await this.$parent.reload()

      if (this.selectedProfile.id === this.view.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('updateFocus', successor.id)
        return
        // if removing top ancestor on a partner line show the new top ancestor
      } else if (this.selectedProfile.id === this.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('setFocus', successor.id)
      } else {
        if (this.view.focus === this.focus) {
          // if we are on the main tree now
          this.deleteNodeInNestedWhakapapa(this.selectedProfile)
        } else {
          // if we are on a partners tree
          // change focus back
          this.$emit('change-focus', this.view.focus)
        }
      }

      this.setSelectedProfile(null)
    },
    async processDeletePerson () {
      if (!this.canDelete(this.selectedProfile)) return

      await this.deletePerson({ id: this.selectedProfile.id })

      // if removing top ancestor on main whanau line, update the whakapapa view focus with child/partner
      if (this.selectedProfile.id === this.view.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('updateFocus', successor.id)

        // if removing top ancestor on a partner line show the new top ancestor
      } else if (this.selectedProfile.id === this.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('setFocus', successor.id)
      } else {
        this.deleteNodeInNestedWhakapapa(this.selectedProfile)
      }
      this.setSelectedProfile(null)
    },
    async getSuggestions (name) {
      if (!name) {
        this.suggestions = []
        return
      }

      let records = await findByName(name, {
        type: this.currentAccess.type === ACCESS_KAITIAKI ? 'person/admin' : 'person',
        groupId: this.view.recps[0]
      })

      if (this.source !== 'new-registration') {
      //  DOES THIS DO ANYTHING? 4/11/21
      // TODO: If nothing is broken after awhile remove
        // var profiles = {} // flatStore for these suggestions

        // records.forEach(record => {
        //   record.children = record.children.map(child => {
        //     profiles[child.id] = child // add this records children to the flatStore
        //     return child.id // only want the childs ID
        //   })
        //   record.parents = record.parents.map(parent => {
        //     profiles[parent.id] = parent // add this records parents to the flatStore
        //     return parent.id // only want the parents ID
        //   })
        //   profiles[record.id] = record // add this record to the flatStore
        // })

        this.predecessorArray = []
        await this.getNodePredecessors(this.selectedProfile.id) // Get the predecessors of the current node

        const updatedRecords = []

        records.forEach(record => {
          var recordIsPredecessor = false
          this.predecessorArray.forEach(predecessor => {
            if (predecessor === record.id) recordIsPredecessor = true
          })
          if (!recordIsPredecessor) updatedRecords.push(record)
        })

        records = updatedRecords
      }

      // sets suggestions which is passed into the dialogs
      this.suggestions = records
    },
    /*
        needed this function because this.profiles keeps track of more than just the nodes in this tree,
        i only needed the nodes in this tree to be able to check if i can add them or not
      */
    findInTree (profileId) {
      if (this.selectedProfile.id === profileId) return true // this is always in the tree

      // if they are a sibling
      if (this.selectedProfile.siblings.some(s => s.id === profileId)) return true

      var isParentsPartner = this.selectedProfile.parents.some(p => {
        if (!p.partners) return false // this parent doesnt have partners
        return p.partners.some(id => {
          return id === profileId
        })
      })

      if (isParentsPartner) return true

      var root = d3.hierarchy(this.nestedWhakapapa)

      var partners = []

      var family = [...root.ancestors(), ...root.descendants()].map(node => {
        if (node.data.partners) {
          node.data.partners.forEach(partner => {
            partners.push(partner)
          })
        }

        return node.data
      }).filter(obj => obj.id !== this.selectedProfile.id) // take this out

      family = [...family, ...partners] // combine them

      if (family.find(obj => obj.id === profileId)) {
        return true // was found
      }
      return false // wasnt found
    },
    async getNodePredecessors (currentId) {
      this.predecessorArray.push(currentId) // Push the current person into predecessors array
      const currentProfile = await this.getProfile(currentId) // Get the current profile

      const { parents, partners, siblings } = currentProfile

      const hasParents = this.arrayIsNotEmpty(parents)
      const hasPartners = this.arrayIsNotEmpty(partners)
      const hasSiblings = this.arrayIsNotEmpty(siblings)

      // Return if there are no parents, partners and siblings on the current node
      if (!hasParents && !hasPartners && !hasSiblings) return

      // Filter out partners of predecessors
      if (hasPartners) this.addToPredecessors(partners)

      // Get the current parents and their predecessors
      const currentProfileParents = parents
      await this.mapPredecessors(currentProfileParents)
    },
    mapPredecessors (currentProfileParents) {
      // Return the predecessors of the current parents
      return Promise.all(currentProfileParents.map(async parent => {
        await this.getNodePredecessors(parent.id)
      }))
    },
    arrayIsNotEmpty (array) {
      return array && array.length > 0
    },
    addToPredecessors (array) {
      array.forEach(person => {
        if (!this.predecessorArray.includes(person.id)) this.predecessorArray.push(person.id)
      })
    },
    t (key, vars) {
      return this.$t('dialogHandler.' + key, vars)
    },
    async reloadWhakapapa () {
      // this current resets the graph to ensure relationships are rendered right. This needs to be improved
      const newWhakapapa = await this.loadDescendants(this.view.focus)
      this.setNestedWhakapapa(newWhakapapa)

      // // reload the view as well (for important relationships)
      // NOTE: we could do this: await this.$parent.reload() but that is an expensive operation

      // this is a hacky way, but its less expensive and ensures the changes
      // made to important relationships are shown
      const whakapapaView = await this.getWhakapapaView(this.view.id)
      this.setView(whakapapaView)
    }
  }
}
</script>
