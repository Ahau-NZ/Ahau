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
      withView
      @getSuggestions="getSuggestions($event)"
      @create="addPerson($event)"
      @close="close"
    />
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
      :profile="selectedProfile"
      :deleteable="canDelete(selectedProfile)"
      @close="close"
      @new="toggleDialog('new-node', $event, 'view-edit-node')"
      @submit="processUpdate($event)"
      @delete="toggleDialog('delete-node', null, null)"
      @open-profile="setSelectedProfile($event)"
      @delete-link="deleteNodeInNestedWhakapapa"
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
import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
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

import { PERMITTED_RELATIONSHIP_ATTRS, getDisplayName } from '@/lib/person-helpers.js'
import { findByName } from '@/lib/search-helpers.js'

import findSuccessor from '@/lib/find-successor'

import mapProfileMixins from '@/mixins/profile-mixins.js'
import { createNamespacedHelpers, mapGetters, mapActions } from 'vuex'
const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')
const { mapGetters: mapWhakapapaGetters, mapMutations: mapWhakapapaMutations } = createNamespacedHelpers('whakapapa')
const { mapActions: mapTribeActions } = createNamespacedHelpers('tribe')
const { mapGetters: mapPersonGetters } = createNamespacedHelpers('person')

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
      mapMethods: ['createPerson', 'updatePerson', 'saveLink', 'getProfile', 'savePerson', 'saveWhakapapa', 'getWhakapapaLink']
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
    ...mapPersonGetters(['selectedProfile']),
    ...mapGetters(['whoami', 'storeDialog', 'storeType', 'currentNotification']),
    ...mapWhakapapaGetters(['nestedWhakapapa']),
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
    ...mapAlertMutations(['showAlert']),
    ...mapTribeActions(['initGroup']),
    ...mapActions(['loading', 'setDialog']),
    ...mapWhakapapaMutations([
      'updateNodeInNestedWhakapapa',
      'deleteNodeInNestedWhakapapa'
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
    async setupNewCommunity ($event) {
      // (later?)
      // - [ ] create a copy of your personal profile (recps: [groupId])
      // - [ ] link your feedId + profile
      //    - saveFeedProfileLink (recps: [groupId])
      try {
        if ($event.id) throw new Error('this is for creating a new tribe + community, not updating')

        const group = await this.initGroup($event)
        this.$router.push({ name: 'community/profile', params: { tribeId: group.groupId, profileId: group.private[0].id } }).catch(() => {})
      } catch (err) {
        console.error('Something went wrong while trying to create private group', $event)
        console.error(err)
        this.showAlert({
          message: 'Failed to create the private group. Please contact us if this continues to happen',
          delay: 5000,
          color: 'red'
        })
      }
    },
    async addPerson (input) {
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
          var child = id
          var parentProfile = this.dialogType === 'child'
            ? this.selectedProfile
            : this.selectedProfile.parent // for siblings we take the first parent

          if (!ignored) {
            // create the link
            await this.createChildLink({
              child,
              parent: parentProfile.id,
              relationshipAttrs
            })
          }

          // Add parents if parent quick links
          if (parents) await this.quickAddParents(id, parents)

          // load the childs profile
          parentProfile = await this.loadDescendants(parentProfile.id)

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
            if (this.selectedProfile.parent) { // when a node already has a parent node above them, this will be called
              parentProfile = await this.loadDescendants(this.selectedProfile.parent.id)
              this.updateNodeInNestedWhakapapa(parentProfile)

              // so you wont see the extra parent update
            } else {
              // when the child doesnt have a parent above them, this will be called
              // load the new parents profile
              parentProfile = await this.loadDescendants(parent)
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
          const relationshipAttrs = pick(parent, ['relationshipType', 'legallyAdopted'])
          await this.createChildLink({ child, parent: parent.id, relationshipAttrs })
        })
      )
    },
    async quickAddChildren (parent, children) {
      await Promise.all(
        children.map(async child => {
          const relationshipAttrs = pick(child, ['relationshipType', 'legallyAdopted'])
          await this.createChildLink({ child: child.id, parent, relationshipAttrs })
        })
      )
    },

    async createNewPerson (input) {
      // if there is an id, we dont need to create, just return the id
      if (input.id) return input.id

      // setup new profile required fields
      input.type = 'person'
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

      await this.saveWhakapapa(input)
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
      if (!input) return

      if (input.recps) { // cant have recps on an update
        delete input.recps
      }

      const profileId = this.selectedProfile.id

      // update their profile
      await this.updatePerson({ id: profileId, ...input })

      // update the relationship
      const relationshipAttrs = pick(input, PERMITTED_RELATIONSHIP_ATTRS)

      var { relationshipType, legallyAdopted, parent } = this.selectedProfile

      // TEMP: skips saving relationship if there is no relationship on the selectedProfile
      if (!isEmpty(relationshipAttrs) && profileId !== this.view.focus && parent) {
        // get the link between the parent and child
        var oldLink = await this.getWhakapapaLink(parent.id, profileId)

        let input = {
          type: 'link/profile-profile/child',
          linkId: oldLink.linkId,
          child: profileId,
          parent: parent.id,
          ...relationshipAttrs
        }

        await this.saveLink(input)

        relationshipType = relationshipAttrs.relationshipType
        legallyAdopted = relationshipAttrs.legallyAdopted
      }

      if (parent) {
        var node = await this.loadDescendants(parent.id)

        this.selectedProfile.relationshipType = relationshipType
        this.selectedProfile.legallyAdopted = legallyAdopted
        this.selectedProfile.parent = node

        this.updateNodeInNestedWhakapapa(node)
      } else {
        var rootNode = await this.loadDescendants(profileId)
        this.updateNodeInNestedWhakapapa(rootNode)
      }
    },
    async removeProfile (deleteOrIgnore) {
      if (deleteOrIgnore === 'delete') {
        await this.deletePerson()
      } else {
        await this.ignoreProfile()
      }
    },
    async ignoreProfile () {
      const input = {
        id: this.$route.params.whakapapaId,
        ignoredProfiles: {
          add: [this.selectedProfile.id]
        }
      }

      await this.saveWhakapapa(input)
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
    async deletePerson () {
      if (!this.canDelete(this.selectedProfile)) return

      var input = {
        id: this.selectedProfile.id,
        tombstone: { date: new Date() }
      }

      await this.savePerson(input)

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
    async getSuggestions ($event) {
      if (!$event) {
        this.suggestions = []
        return
      }
      var records = await findByName($event)

      if (isEmpty(records)) {
        this.suggestions = []
        return
      }

      // filter out all records that arent in the current tribe
      records = records.filter(record => {
        return isEqual(record.recps, this.view.recps)
      })

      if (this.source !== 'new-registration') {
        var profiles = {} // flatStore for these suggestions

        records.forEach(record => {
          record.children = record.children.map(child => {
            profiles[child.id] = child // add this records children to the flatStore
            return child.id // only want the childs ID
          })
          record.parents = record.parents.map(parent => {
            profiles[parent.id] = parent // add this records parents to the flatStore
            return parent.id // only want the parents ID
          })
          profiles[record.id] = record // add this record to the flatStore
        })

        // now we have the flatStore for the suggestions we need to filter out the records
        // so we cant add one that is already in the tree
        // records = records.filter(record => !this.findInTree(record.id))

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
      this.suggestions = Object.assign([], records)
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
      // const hasSiblings = []

      // Return if there are no parents, partners and siblings on the current node
      if (!hasParents && !hasPartners && !hasSiblings) return

      // Filter out partners of predecessors
      if (hasPartners) this.addToPredecessors(partners)
      // Filter out siblings of predecessors
      // if (hasSiblings) this.addToPredecessors(siblings)

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
    }
  }
}
</script>
