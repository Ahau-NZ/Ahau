<template>
  <div id="container">
    <ReviewRegistrationDialog
      v-if="isActive('review-registration')"
      :show="isActive('review-registration')"
      :title="`Request to join : ${currentNotification.group.preferredName}`"
      :notification="currentNotification"
      @close="close"
    />
    <NewCommunityDialog
      v-if="isActive('new-community')"
      :show="isActive('new-community')"
      :title="`Ko Wai Mātou ---- Create New Community`"
      @submit="setupNewCommunity($event)"
      @close="close"
    />
    <NewNodeDialog
      v-if="isActive('new-node')"
      :show="isActive('new-node')"
      :title="`Add ${dialogType} to ${getDisplayName(selectedProfile)}`"
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
      :title="`Edit ${getDisplayName(selectedProfile)}`"
      @submit="processUpdate($event)"
      @close="close"
      :profile="profile"
    />
    <SideViewEditNodeDialog
      v-if="isActive('view-edit-node')"
      :show="isActive('view-edit-node')"
      :profile="selectedProfile"
      :deleteable="canDelete(selectedProfile)"
      :warnAboutChildren="selectedProfile && selectedProfile.id !== nestedWhakapapa.id"
      :sideMenu="true"
      @close="close"
      @new="toggleDialog('new-node', $event, 'view-edit-node')"
      @submit="processUpdate($event)"
      @delete="toggleDialog('delete-node', null, null)"
      @open-profile="setSelectedProfile($event)"
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
      :title="`Whakapapa ---- Family tree`"
      @close="close"
    />
    <WhakapapaTableHelper
      v-if="isActive('whakapapa-table-helper')"
      :show="isActive('whakapapa-table-helper')"
      :title="`Whakapapa registry`"
      @close="close"
    />
    <FilterMenu
      v-if="isActive('table-filter-menu')"
      :show="isActive('table-filter-menu')"
      :title="`Table Filter Menu`"
      :searchFilterString.sync="searchFilterString"
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
import SideViewEditNodeDialog from '@/components/dialog/profile/SideViewEditNodeDialog.vue'
import DeleteNodeDialog from '@/components/dialog/profile/DeleteNodeDialog.vue'
import WhakapapaViewDialog from '@/components/dialog/whakapapa/WhakapapaViewDialog.vue'
import WhakapapaEditDialog from '@/components/dialog/whakapapa/WhakapapaEditDialog.vue'
import WhakapapaDeleteDialog from '@/components/dialog/whakapapa/WhakapapaDeleteDialog.vue'
import WhakapapaShowHelper from '@/components/dialog/whakapapa/WhakapapaShowHelper.vue'
import WhakapapaTableHelper from '@/components/dialog/whakapapa/WhakapapaTableHelper.vue'
import FilterMenu from '@/components/dialog/whakapapa/FilterMenu.vue'
import ComingSoonDialog from '@/components/dialog/ComingSoonDialog.vue'
import ReviewRegistrationDialog from '@/components/dialog/registration/ReviewRegistrationDialog.vue'

import { PERMITTED_RELATIONSHIP_ATTRS, getDisplayName } from '@/lib/person-helpers.js'
import { createGroup, saveCommunity, savePublicCommunity, saveGroupProfileLink } from '@/lib/community-helpers'
import { saveWhakapapaView } from '@/lib/whakapapa-helpers.js'
import { findByName } from '@/lib/search-helpers.js'
import tree from '@/lib/tree-helpers'

import findSuccessor from '@/lib/find-successor'

import mapProfileMixins from '@/mixins/profile-mixins.js'
import { createNamespacedHelpers, mapGetters, mapActions, mapMutations } from 'vuex'
const { mapMutations: mapAlertMutations } = createNamespacedHelpers('alerts')

export default {
  name: 'DialogHandler',
  components: {
    NewNodeDialog,
    EditNodeDialog,
    SideViewEditNodeDialog,
    DeleteNodeDialog,
    WhakapapaViewDialog,
    WhakapapaEditDialog,
    WhakapapaDeleteDialog,
    WhakapapaShowHelper,
    WhakapapaTableHelper,
    FilterMenu,
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
    relationshipLinks: {
      type: Map
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
      mapMethods: ['getTribe', 'createPerson', 'updatePerson', 'saveLink', 'savePerson', 'saveWhakapapa']
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
      searchFilterString: ''
    }
  },
  computed: {
    ...mapGetters(['nestedWhakapapa', 'selectedProfile', 'whoami', 'storeDialog', 'storeType', 'currentNotification']),
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
    },
    searchFilterString (newValue) {
      this.$emit('update:searchFilterString', newValue)
    }
  },
  methods: {
    getDisplayName,
    ...mapAlertMutations(['showAlert']),
    ...mapMutations([
      'updatePartnerInNestedWhakapapa',
      'updateNodeInNestedWhakapapa',
      'deleteNodeInNestedWhakapapa',
      'addChildToNestedWhakapapa',
      'addParentToNestedWhakapapa',
      'addPartnerToNestedWhakapapa'
    ]),
    ...mapActions(['loading', 'setDialog',
      'setProfileById'
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

        const createGroupRes = await this.$apollo.mutate(
          createGroup()
        )
        if (createGroupRes.errors) throw new Error('Failed to create private group', createGroupRes.errors)
        const groupId = createGroupRes.data.createGroup.id

        // Note: this auto-sets the authors to allow all authors
        const input = {
          ...$event,
          authors: {
            add: [this.whoami.public.feedId]
          }
        }

        const createCommunityRes = await this.$apollo.mutate(
          saveCommunity({
            ...input,
            recps: [groupId]
          })
        )
        if (createCommunityRes.errors) throw new Error('Failed to create community profile', createCommunityRes.errors)
        const groupProfileId = createCommunityRes.data.saveProfile // id

        const profileLinkRes = await this.$apollo.mutate(
          saveGroupProfileLink({
            profile: groupProfileId,
            group: groupId
          })
        )
        if (profileLinkRes.errors) throw new Error('Failed to create community profile link', profileLinkRes.errors)

        const createPublicCommunityRes = await this.$apollo.mutate(
          savePublicCommunity(
            input
          )
        )
        if (createPublicCommunityRes.errors) throw new Error('Failed to create public community profile', createPublicCommunityRes.errors)
        const groupPublicProfile = createPublicCommunityRes.data.saveProfile // id

        const profilePublicLinkRes = await this.$apollo.mutate(
          saveGroupProfileLink({
            profile: groupPublicProfile,
            group: groupId,
            allowPublic: true
          })
        )
        if (profilePublicLinkRes.errors) throw new Error('Failed to create public community profile link', profilePublicLinkRes.errors)
        if (profilePublicLinkRes.data.saveGroupProfileLink) {
          this.$router.push({ name: 'community/profile', params: { tribeId: groupId, profileId: groupProfileId } }).catch(() => {})
        }
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
    async addPerson ($event) {
      try {
        var { id } = $event

        if (this.view.ignoredProfiles.includes(id)) {
          const input = {
            id: this.$route.params.whakapapaId,
            ignoredProfiles: {
              remove: [id]
            }
          }
          await this.saveWhakapapa(input)
          this.$emit('refreshWhakapapa')

          let child, parent

          switch (this.dialogType) {
            case 'child':
              child = id
              parent = this.selectedProfile.id

              var profile = await this.loadDescendants(child)

              // add child to parent
              this.addChildToNestedWhakapapa({
                child: profile,
                parent: this.selectedProfile
              })

              break
            case 'parent':
              child = this.selectedProfile.id
              parent = id

              if (child === this.view.focus) {
                // in this case we're updating the top of the graph, we update view.focus to that new top parent
                this.$emit('updateFocus', parent)
                this.addParentToNestedWhakapapa({
                  child: this.selectedProfile,
                  parent: profile
                })
              } else {
                // load the profile insteaad
                const profile = await this.getRelatives(parent)
                if (profile.children.length === 1) {
                  profile.children[0] = this.selectedProfile
                }

                this.addParentToNestedWhakapapa({
                  child: this.selectedProfile,
                  parent: profile
                })

                // if the parent is the new head of the tree and is being added on a partner family line that update the tree
                if (this.selectedProfile.parents.length === 1) {
                  this.$emit('change-focus', profile.id)
                }
              }
              break
            case 'sibling':
              if (!this.selectedProfile.parents) break
              parent = this.selectedProfile.parents[0].id
              child = id

              var profileSibling = await this.loadDescendants(child)
              profileSibling.parents[0] = this.selectedProfile.parents[0]

              // add child to parent
              this.addChildToNestedWhakapapa({
                child: profileSibling,
                parent: this.selectedProfile.parents[0]
              })
              break
            case 'partner':
              // TODO: add functions for adding partners
              console.error('cannot add partners yet')
              break
            default:
              console.error('Add person was unsuccessful. Could not detect the relationship type')
          }

          return
        } else {
          // if person doesnt exist create one
          if (!id) {
            $event.type = 'person'
            $event.authors = {
              add: [
                $event.recps.includes(this.whoami.personal.groupId)
                  ? this.whoami.public.feedId // set it to my own feedId, making only i can edit
                  : '*' // set it to allow all authors
              ]
            }
            // set the authors
            id = await this.createPerson($event)
            if (!id) return
          }

          let child, parent
          const relationshipAttrs = pick($event, [
            'relationshipType',
            'legallyAdopted'
          ])

          switch (this.dialogType) {
            case 'child':
              child = id
              parent = this.selectedProfile.id
              await this.createChildLink({
                child,
                parent,
                ...relationshipAttrs
              })

              const profile = await this.loadDescendants(child)

              profile.parents[0] = this.selectedProfile

              // add child to parent
              this.addChildToNestedWhakapapa({
                child: profile,
                parent: this.selectedProfile
              })

              break
            case 'parent':
              child = this.selectedProfile.id
              parent = id

              // load the parent profile
              var parentProfile = await this.getRelatives(parent)

              // if they arent already a child
              if (!parentProfile.children.some(d => d.profile.id === child)) {
                // then link them as a child
                await this.createChildLink({
                  child,
                  parent,
                  ...relationshipAttrs
                })

                // reload the parents profile with the new changes
                // this updates the selected profile too
                parentProfile = await this.loadDescendants(parent)
              }

              if (child === this.view.focus) {
                // in this case we're updating the top of the graph, we update view.focus to that new top parent
                this.$emit('updateFocus', parent)
              } else {
                this.addParentToNestedWhakapapa({
                  child: this.selectedProfile,
                  parent: parentProfile
                })

                // if the parent is the new head of the tree and is being added on a partner family line that update the tree
                if (this.selectedProfile.parents.length === 1) {
                  this.$emit('change-focus', parentProfile.id)
                }
              }
              break
            case 'sibling':
              if (!this.selectedProfile.parents) break
              parent = this.selectedProfile.parents[0].id
              child = id
              await this.createChildLink({
                child,
                parent,
                ...relationshipAttrs
              })

              const profileSibling = await this.loadDescendants(child)

              profileSibling.parents[0] = this.selectedProfile.parents[0]

              // add child to parent
              this.addChildToNestedWhakapapa({
                child: profileSibling,
                parent: this.selectedProfile.parents[0]
              })
              break
            case 'partner':
              // TODO: add functions for adding partners
              console.error('cannot add partners yet')
              break
            default:
              console.error('not built')
          }
        }
      } catch (err) {
        throw err
      }
    },

    async createChildLink (input) {
      input.type = 'link/profile-profile/child'
      input.recps = this.view.recps

      await this.saveLink(input)
    },
    async processUpdate (input) {
      if (!input) return

      if (input.recps) { // cant have recps on an update
        delete input.recps
      }

      const profileId = this.selectedProfile.id
      await this.updatePerson({ id: profileId, ...input })

      const relationshipAttrs = pick(input, PERMITTED_RELATIONSHIP_ATTRS)
      // TEMP: skips saving relationship if there is no relationship on the selectedProfile
      if (!isEmpty(relationshipAttrs) && this.selectedProfile.id !== this.view.focus && this.selectedProfile.relationship) {
        const relationship = this.selectedProfile.relationship
        let input = {
          type: 'link/profile-profile/child',
          linkId: relationship.linkId,
          child: relationship.child,
          parent: relationship.parent,
          ...relationshipAttrs
        }

        await this.saveLink(input)

        this.relationshipLinks.set(relationship.parent + '-' + relationship.child, input)
        this.selectedProfile.relationship = input
        let node = this.selectedProfile
        this.updateNodeInNestedWhakapapa(node)
      }

      if (this.storeDialog === 'edit-node') {
        this.setProfileById({
          id: profileId
        })
      }

      // reload the selectedProfiles personal details
      var node = await this.loadKnownFamily(true, this.selectedProfile)
      // apply the changes to the nestedWhakapapa
      if (this.selectedProfile.isPartner && this.selectedProfile.id !== this.focus) {
        this.updatePartnerInNestedWhakapapa(node)
      } else {
        this.updateNodeInNestedWhakapapa(node)
      }

      // reorder children if there is a change in birthorder
      // if (input.birthOrder) {
      //   var nestedParent = tree.find(this.nestedWhakapapa, this.selectedProfile.parents[0].id)
      //   nestedParent.children = nestedParent.children.sort((a, b) => {
      //     return a.birthOrder - b.birthOrder
      //   })
      //   this.updateNodeInNestedWhakapapa(nestedParent)
      // }

      // reset the selectedProfile to the newly changed one
      this.setSelectedProfile(node)
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
      try {
        const res = await this.$apollo.mutate(saveWhakapapaView(input))
        this.$emit('refreshWhakapapa')
        if (res.data) {
          // if removing top ancestor on main whanau line, update the whakapapa view focus with child/partner
          if (this.selectedProfile.id === this.view.focus) {
            const successor = findSuccessor(this.selectedProfile)
            this.$emit('updateFocus', successor.id)
            return
            // if removing top ancestor on a partner line show the new top ancestor
          } else if (this.selectedProfile.id === this.focus) {
            const successor = findSuccessor(this.selectedProfile)
            this.$emit('setFocus', successor.id)
          } else {
            this.deleteNodeInNestedWhakapapa(this.selectedProfile)
          }
          this.setSelectedProfile(null)
        } else {
          console.error(res)
        }
      } catch (err) {
        throw err
      }
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
            profiles[child.profile.id] = child.profile // add this records children to the flatStore
            return child.profile.id // only want the childs ID
          })
          record.parents = record.parents.map(parent => {
            profiles[parent.profile.id] = parent.profile // add this records parents to the flatStore
            return parent.profile.id // only want the parents ID
          })
          profiles[record.id] = record // add this record to the flatStore
        })

        // now we have the flatStore for the suggestions we need to filter out the records
        // so we cant add one that is already in the tree
        records = records.filter(record => !this.findInTree(record.id))

        // hydrate all the left over records
        records = records.map(record => {
          return tree.hydrate(record, profiles) // needed to hydrate to fix all dates
        })
      }

      records = records.map(profile => ({ profile }))

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
      if (this.selectedProfile.siblings) {
        if (this.selectedProfile.siblings.find(sibling => {
          return sibling.id === profileId
        })) return true // filter them out
      }

      if (this.selectedProfile.parents) {
        // if they are a parents partner
        if (this.selectedProfile.parents.find(parent => {
          if (!parent.partners) return false // this parent doesnt have parters
          return parent.partners.find(partnerId => {
            return partnerId === profileId
          })
        })) return true // filter them out
      }

      var root = d3.hierarchy(this.nestedWhakapapa)

      var partners = []

      var family = [...root.ancestors(), ...root.descendants()].map(node => {
        node.data.partners.forEach(partner => {
          partners.push(partner)
        })
        return node.data
      }).filter(obj => obj.id !== this.selectedProfile.id) // take this out

      family = [...family, ...partners] // combine them

      if (family.find(obj => obj.id === profileId)) {
        return true // was found
      }
      return false // wasnt found
    }
  }
}
</script>
