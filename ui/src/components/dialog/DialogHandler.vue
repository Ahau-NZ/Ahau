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
      :isInTree="isInTree"
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
      @delete="toggleDialog('delete-node', null, null)"
      @reload-whakapapa="reloadWhakapapa"
      :view="view"
      :preview="previewProfile"
    />
    <DeleteNodeDialog
      v-if="isActive('delete-node')"
      :show="isActive('delete-node')"
      :profile="selectedProfile"
      :warnAboutChildren="selectedProfile && selectedProfile.id !== focus"
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
    loadKnownFamily: Function,
    getRelatives: Function
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile', 'tribe']
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
    ...mapGetters(['whoami', 'storeDialog', 'storeType', 'currentNotification', 'currentAccess']),
    ...mapGetters('person', ['selectedProfile']),
    ...mapGetters('whakapapa', ['focus', 'getImportantRelationship']),
    ...mapGetters('whakapapa', { view: 'whakapapaView' }),
    ...mapGetters('tree', ['getParentNodeId', 'getNode', 'getPartnerNode']),
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
    ...mapActions(['loading', 'setDialog']),
    ...mapActions('profile', ['getProfile']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('tribe', ['initGroup']),
    ...mapActions('person', [
      'createPerson',
      'loadPersonFull',
      'updatePerson',
      'deletePerson',
      'setSelectedProfileById',
      'findPersonByName'
    ]),
    ...mapActions('whakapapa', [
      'loadWhakapapaView',
      'loadDescendants',
      'saveWhakapapaView',
      'addLinks',
      'saveLink',
      'getLink',
      'removeLinksToProfile',
      'deleteProfileFromImportantRelationships'
    ]),
    isActive (type) {
      return (type === this.dialog || type === this.storeDialog)
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

      const isNewProfile = !input.id
      if (isNewProfile) id = await this.createNewPerson(input)

      const isIgnoredProfile = this.view.ignoredProfiles.includes(id)
      if (isIgnoredProfile) this.removeIgnoredProfile(id)

      const relationshipAttrs = pick(input, ['relationshipType', 'legallyAdopted'])

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

          if (!isIgnoredProfile) {
            // create the link
            await this.createChildLink({
              child,
              parent: parentProfileId,
              relationshipAttrs
            })
          }

          // Add parents if parent quick links
          if (parents) await this.quickAddParents(id, parents)

          this.loadDescendants({ profileId: parentProfileId })

          break

        case 'parent':
          child = this.selectedProfile.id
          var parent = id

          if (!isIgnoredProfile) {
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

          if (child === this.view.focus) this.$emit('persist-focus', parent)
          else {
            let parentId = this.getParentNodeId(child)

            // when a node already has a parent node above them, this will be called
            if (parentId) { // when a node already has a parent node above them, this will be called
              await this.loadDescendants(parentId)
              // TODO change to take a second argument "depth", or make loadDescendantsToDepth
              // TODO cherese 9-3-22 also replace loadWhakapapa within SideNodeDialog.vue
            } else {
              // when the child doesnt have a parent above them, this will be called
              // load the new parents profile
              this.$emit('set-focus-to-ancestor-of', parent)
            }
          }
          break
        case 'partner':
          parent = this.selectedProfile.id
          child = id

          // create the link
          if (!isIgnoredProfile) await this.createPartnerLink({ parent, child })

          // Add children if children quick add links
          if (children) await this.quickAddChildren(id, children)

          // TODO: this adds the partner to the tree, but do we need to do this much?
          await this.loadDescendants(this.selectedProfile.id)
          break
        default:
          console.error('wrong type for add person')
      }
    },
    async quickAddParents (child, parents) {
      await Promise.all(
        parents.map(async parent => {
          // check if a link already exists
          const link = await this.getLink({ parent: parent.id, child })
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
          const link = await this.getLink({ parent, child: child.id })
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
      await this.saveWhakapapaView({
        id: this.$route.params.whakapapaId,
        ignoredProfiles: {
          remove: [id]
        }
      })
    },

    async createChildLink ({ child, parent, relationshipAttrs }) {
      return this.saveLink({
        type: 'link/profile-profile/child',
        child,
        parent,
        recps: this.view.recps,
        ...relationshipAttrs
      })
        .then(() => {
          this.addLinks({ childLinks: [{ parent, child, ...relationshipAttrs }] })
        })
    },
    async createPartnerLink ({ child, parent }) {
      return this.saveLink({
        type: 'link/profile-profile/partner',
        child,
        parent,
        recps: this.view.recps
      })
        .then(() => this.addLinks({ partnerLinks: [{ parent, child }] }))
    },
    // TODO: see what is using this and move it into that component instead
    async processUpdate (input) {
      if (input.recps) delete input.recps

      const profileId = this.selectedProfile.id
      // update their profile in the db
      await this.updatePerson({ id: profileId, ...input })

      // loads their full profile for changes in the tree as well as the side node dialog
      await this.loadPersonFull(profileId)
    },
    async removeProfile (deleteOrIgnore) {
      await this.deleteProfileFromImportantRelationships(this.selectedProfile.id)
      if (deleteOrIgnore === 'delete') await this.processDeletePerson()
      else await this.ignoreProfile()
    },

    // TODO 2022-03-12 mix - move to vuex?
    async addImportantRelationship (input) {
      // Check if we are moving a partner connection
      var profile = (input.moveDup || this.dialogType === 'child') ? input : this.selectedProfile

      // check if there is already an existing important relationship
      const exsistingDupe = this.getImportantRelationship(profile.id)
      var lessRelationship

      if (exsistingDupe) {
        // YES - there is an important relationship so we use that one instead
        lessRelationship = exsistingDupe.primary.profileId
      } else {
        // NO - there isnt an important relationship so we find the parent which takes "presidence"
        lessRelationship = (profile.parents && profile.parents.length && this.isInTree(profile.parents[0].id))
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

      await this.saveWhakapapaView({
        id: this.$route.params.whakapapaId,
        importantRelationships: importantRelationship
      })
    },
    // END TODO

    async ignoreProfile () {
      await this.saveWhakapapaView({
        id: this.$route.params.whakapapaId,
        ignoredProfiles: {
          add: [this.selectedProfile.id]
        }
      })

      if (this.selectedProfile.id === this.view.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('persist-focus', successor.id)
        return
        // if removing top ancestor on a partner line show the new top ancestor
      } else if (this.selectedProfile.id === this.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('set-focus', successor.id)
      } else {
        if (this.view.focus === this.focus) {
          // if we are on the main tree now
          this.removeLinksToProfile(this.selectedProfile.id)
        } else {
          // if we are on a partners tree
          // change focus back
          this.$emit('set-focus-to-ancestor-of', this.view.focus)
        }
      }

      this.setSelectedProfileById(null)
    },
    async processDeletePerson () {
      if (!this.canDelete(this.selectedProfile)) return

      await this.deletePerson({ id: this.selectedProfile.id })

      // if removing top ancestor on main whanau line, update the whakapapa view focus with child/partner
      if (this.selectedProfile.id === this.view.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('persist-focus', successor.id)

        // if removing top ancestor on a partner line show the new top ancestor
      } else if (this.selectedProfile.id === this.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('set-focus', successor.id)
      } else {
        this.removeLinksToProfile(this.selectedProfile.id)
      }
      this.setSelectedProfileById(null)
    },
    async getSuggestions (name) {
      if (!name) {
        this.suggestions = []
        return
      }

      let records = await this.findPersonByName({
        name,
        type: this.currentAccess.type === ACCESS_KAITIAKI ? 'person/admin' : 'person',
        groupId: this.view.recps[0]
      })

      if (this.source !== 'new-registration') {
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
    isInTree (profileId) {
      return Boolean(
        this.getNode(profileId) ||
        this.getPartnerNode(profileId)
      )
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
      this.loadWhakapapaView(this.view.id)
    }
  }
}
</script>
