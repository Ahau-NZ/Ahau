<template>
  <div id="container">
    <NewRegistrationDialog
      v-if="isActive('new-registration')"
      :show="isActive('new-registration')"
      :profile="whoami.personal.profile"
      :title="`Request to join : ${currentProfile.preferredName}`"
      :parents.sync="parents"
      :parentIndex.sync="parentIndex"
      @editProfile="toggleEditProfile($event)"
      @close="close"
    />
    <NewCommunityDialog
      v-if="isActive('new-community')"
      :show="isActive('new-community')"
      :title="`Ko Wai Mātou ---- Create New Community`"
      :type="dialogType"
      @create="setupNewCommunity($event)"
      @close="close"
    />
    <EditCommunityDialog
      v-if="isActive('edit-community')"
      :show="isActive('edit-community')"
      :title="`Edit ${currentProfile.preferredName}`"
      @delete="toggleDialog('delete-community', null, 'edit-community')"
      @submit="updateCommunity($event)"
      @close="close"
      :selectedProfile="currentProfile"
    />
    <DeleteCommunityDialog
      v-if="isActive('delete-community')"
      :show="isActive('delete-community')"
      @submit="deleteCommunity"
      @close="close"
    />
    <NewNodeDialog
      v-if="isActive('new-node')"
      :show="isActive('new-node')"
      :title="source !== 'new-registration' ? `Add ${dialogType} to ${selectedProfile.preferredName}`:`Add ${dialogType} to Registration Form`"
      :selectedProfile="selectedProfile"
      :suggestions="suggestions"
      :withView="source !== 'new-registration'"
      @getSuggestions="getSuggestions($event)"
      @create="source !== 'new-registration' ? addPerson($event) : dialogType === 'grandparent' ? addGrandparentToRegistartion($event) : addParentToRegistration($event)"
      @close="close"
    />
    <EditNodeDialog
      v-if="isActive('edit-node')"
      :show="isActive('edit-node')"
      :title="source === 'new-registration' ? `Edit ${registration.preferredName}`:`Edit ${currentProfile.preferredName}`"
      @submit="updatePerson($event)"
      @close="close"
      :profile="source === 'new-registration' ? registration : currentProfile"
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
      @submit="updatePerson($event)"
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
    <WhakapapaShowHelper v-if="isActive('whakapapa-helper')"
      :show="isActive('whakapapa-helper')"
      :title="`Whakapapa ---- Family tree`"
      @close="close"
    />
    <WhakapapaTableHelper v-if="isActive('whakapapa-table-helper')"
      :show="isActive('whakapapa-table-helper')"
      :title="`Whakapapa registry`"
      @close="close"
    />
    <!-- <NewCollectionDialog
      :show="isActive('new-collection')"
      :title="'Create a new Collection'"
      @close="close"
      @submit="console.log('TODO: add collection to profile')"
    />-->
    <ComingSoonDialog :show="isActive('coming-soon')" @close="close" />
    <ConfirmationMessage :show="snackbar" :message="confirmationText" />
  </div>
</template>

<script>
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import NewCommunityDialog from '@/components/dialog/community/NewCommunityDialog.vue'
import NewRegistrationDialog from '@/components/dialog/registration/NewRegistrationDialog.vue'
import EditCommunityDialog from '@/components/dialog/community/EditCommunityDialog.vue'
import DeleteCommunityDialog from '@/components/dialog/community/DeleteCommunityDialog.vue'
import EditNodeDialog from '@/components/dialog/profile/EditNodeDialog.vue'
import SideViewEditNodeDialog from '@/components/dialog/profile/SideViewEditNodeDialog.vue'
import DeleteNodeDialog from '@/components/dialog/profile/DeleteNodeDialog.vue'
import WhakapapaViewDialog from '@/components/dialog/whakapapa/WhakapapaViewDialog.vue'
import WhakapapaEditDialog from '@/components/dialog/whakapapa/WhakapapaEditDialog.vue'
import WhakapapaDeleteDialog from '@/components/dialog/whakapapa/WhakapapaDeleteDialog.vue'
import WhakapapaShowHelper from '@/components/dialog/whakapapa/WhakapapaShowHelper.vue'
import WhakapapaTableHelper from '@/components/dialog/whakapapa/WhakapapaTableHelper.vue'
// import NewCollectionDialog from '@/components/dialog/archive/NewCollectionDialog.vue'
import ComingSoonDialog from '@/components/dialog/ComingSoonDialog.vue'
import ConfirmationMessage from '@/components/dialog/ConfirmationMessage.vue'

import gql from 'graphql-tag'

import { PERMITTED_RELATIONSHIP_ATTRS, savePerson, saveCurrentIdentity } from '@/lib/person-helpers.js'
import { createGroup, saveCommunity, savePublicCommunity, saveGroupProfileLink, deleteTribe, updateTribe } from '@/lib/community-helpers'
import { saveWhakapapaView } from '@/lib/whakapapa-helpers.js'

import { saveLink } from '@/lib/link-helpers.js'
import tree from '@/lib/tree-helpers'
import findSuccessor from '@/lib/find-successor'

import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import * as d3 from 'd3'
import { mapGetters, mapActions } from 'vuex'

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
    // NewCollectionDialog,
    ComingSoonDialog,
    NewCommunityDialog,
    EditCommunityDialog,
    DeleteCommunityDialog,
    ConfirmationMessage,
    NewRegistrationDialog
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
        'edit-community', 'new-community', 'new-node', 'view-edit-node', 'delete-node', 'new-collection', 'new-story', 'edit-story', 'edit-node', 'delete-story',
        'whakapapa-view', 'whakapapa-edit', 'whakapapa-delete', 'whakapapa-helper', 'whakapapa-table-helper', 'new-registration'
      ].includes(val)
    },
    type: {
      type: String,
      default: null,
      validator: (val) => [
        'parent', 'child', 'sibling', 'registration', 'grandparent'
      ].includes(val)
    },
    loadDescendants: Function,
    loadKnownFamily: Function,
    setSelectedProfile: Function,
    getRelatives: Function
  },
  data () {
    return {
      snackbar: false,
      confirmationText: null,
      suggestions: [],
      source: null,
      registration: '',
      dialogType: '',
      parents: [],
      parentIndex: null
    }
  },
  computed: {
    ...mapGetters(['nestedWhakapapa', 'selectedProfile', 'whoami', 'storeDialog', 'storeType', 'storeSource', 'currentProfile', 'currentProfiles', 'currentTribe', 'tribes']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    previewProfile () {
      return this.storeType === 'preview'
    }
  },
  watch: {
    // view profile info while in registration dialog
    storeDialog (newValue, OldValue) {
      if (newValue && OldValue === 'new-registration') {
        this.source = 'new-registration'
      }
    },
    type (newVal) {
      this.dialogType = newVal
    },
    storeType (newVal) {
      this.dialogType = newVal
    }
  },
  methods: {
    isPersonalProfile (id) {
      return this.whoami.personal.profile.id === id
    },
    ...mapActions(['setWhoami', 'updateNode', 'deleteNode', 'updatePartnerNode', 'addChild', 'addParent', 'loading', 'setDialog',
      'setProfileById', 'setComponent', 'setCurrentTribe', 'setCurrentTribeById', 'setTribes'
    ]),
    addGrandparentToRegistartion (grandparent) {
      var parent = this.parents[this.parentIndex]
      if (parent.grandparents) {
        parent.grandparents.push(grandparent)
      } else {
        parent = {
          ...parent,
          grandparents: [grandparent]
        }
      }
      this.parents.splice(this.parentIndex, 1, parent)
    },
    addParentToRegistration (parent) {
      this.parents.push(parent)
    },
    toggleEditProfile (profile) {
      this.registration = profile
      this.toggleDialog('edit-node', null, 'new-registration')
    },
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
      if (this.parents.length) this.parents = []
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
      if ($event.id) throw new Error('this is for creating a new tribe + community, not updating')

      // (later?)
      // - [ ] create a copy of your personal profile (recps: [groupId])
      // - [ ] link your feedId + profile
      //    - saveFeedProfileLink (recps: [groupId])
      try {
        const createGroupRes = await this.$apollo.mutate(createGroup())
        if (createGroupRes.errors) {
          console.error('failed to create private group', createGroupRes)
        }
        const groupId = createGroupRes.data.createGroup.id

        const createCommunityRes = await this.$apollo.mutate(saveCommunity({
          ...$event,
          recps: [groupId]
        }))
        if (createCommunityRes.errors) {
          console.error('failed to create community', createCommunityRes)
          return
        }

        const groupProfile = createCommunityRes.data.saveProfile // id

        const profileLinkRes = await this.$apollo.mutate(saveGroupProfileLink({
          profile: groupProfile,
          group: groupId
        }))
        if (profileLinkRes.errors) {
          console.error('failed to create link community profile', profileLinkRes)
          return
        }

        const createPublicCommunityRes = await this.$apollo.mutate(savePublicCommunity({
          ...$event
        }))
        if (createPublicCommunityRes.errors) {
          console.error('failed to create community', createPublicCommunityRes)
          return
        }

        const groupPublicProfile = createPublicCommunityRes.data.saveProfile // id

        const profilePublicLinkRes = await this.$apollo.mutate(saveGroupProfileLink({
          profile: groupPublicProfile,
          group: groupId,
          allowPublic: true
        }))
        if (profilePublicLinkRes.errors) {
          console.error('failed to create link community profile', groupPublicProfile)
          return
        }

        if (profilePublicLinkRes.data.saveGroupProfileLink) {
          this.setCurrentTribeById(groupProfile)
          this.setComponent('profile')
          this.setProfileById({ id: groupProfile })
          this.$router.push({ name: 'profileShow', params: { id: groupProfile } }).catch(() => {})
        }
      } catch (err) {
        // is this the right place for this?
        this.confirmationAlert('Failed to create private group. Please contact us if this continues to happen', err)
        setTimeout(() => {
          this.confirmationText = null
          this.snackbar = !this.snackbar
        }, 5000)
      }
    },
    async updateCommunity ($event) {
      const res = await this.$apollo.mutate(updateTribe(this.currentTribe, $event))
      if (res.errors) {
        console.error('failed to update community', res)
      } else {
        this.setProfileById({ id: res.data.savePrivate })
        this.setCurrentTribeById(res.data.savePrivate)
      }
    },
    async savePerson (input) {
      if (!input.id && !input.recps) input.recps = [this.whoami.personal.groupId]
      // TODO fix recps to be right group
      const res = await this.$apollo.mutate(savePerson(input))

      if (res.errors) {
        console.error(`failed to ${input.id ? 'update' : 'save'} profile`, res)
        return
      }

      return res.data.saveProfile
    },
    async saveCurrentIdentity (input) {
      const res = await this.$apollo.mutate(
        saveCurrentIdentity(
          this.whoami.personal.profile.id,
          this.whoami.public.profile.id,
          input
        )
      )

      if (res.errors) {
        console.error('failed to save identity profile', res)
      }

      // set whoami
      await this.setWhoami()
    },
    async addPerson ($event) {
      try {
        var { id } = $event

        if (this.view.ignoredProfiles.includes(id)) {
          const input = {
            id: this.$route.params.id,
            ignoredProfiles: {
              remove: [id]
            }
          }
          try {
            const res = await this.$apollo.mutate(saveWhakapapaView(input))
            if (res.data) {
              this.$emit('refreshWhakapapa')

              let child, parent

              switch (this.dialogType) {
                case 'child':
                  child = id
                  parent = this.selectedProfile.id

                  var profile = await this.loadDescendants(child, '', [])
                  profile.parents[0] = this.selectedProfile

                  // add child to parent
                  this.addChild({
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
                    this.addParent({
                      child: this.selectedProfile,
                      parent: profile
                    })
                  } else {
                    // load the profile insteaad
                    const profile = await this.getRelatives(parent)
                    if (profile.children.length === 1) {
                      profile.children[0] = this.selectedProfile
                    }

                    this.addParent({
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

                  var profileSibling = await this.loadDescendants(child, '', [])
                  profileSibling.parents[0] = this.selectedProfile.parents[0]

                  // add child to parent
                  this.addChild({
                    child: profileSibling,
                    parent: this.selectedProfile.parents[0]
                  })
                  break
                default:
                  console.error('Add person was unsuccessful. Could not detect the relationship type')
              }

              return
            } else {
              console.error(res)
            }
          } catch (err) {
            throw err
          }
        } else {
          // if person doesnt exist create one
          if (!id) {
            id = await this.savePerson($event)
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

              const profile = await this.loadDescendants(child, '', [])

              profile.parents[0] = this.selectedProfile

              // add child to parent
              this.addChild({
                child: profile,
                parent: this.selectedProfile
              })

              break
            case 'parent':
              child = this.selectedProfile.id
              parent = id
              var childExsists = false

              // load the parent profile
              const parentProfile = await this.getRelatives(parent)

              // if the child is already a child in another whakapapa dont create a new link
              parentProfile.children.map(d => {
                if (d.profile.id === child) {
                  childExsists = true
                }
              })
              // if the child doesnt exsist than create the whakapapa link
              if (!childExsists) {
                await this.createChildLink({
                  child,
                  parent,
                  ...relationshipAttrs
                })
              }

              if (child === this.view.focus) {
                // in this case we're updating the top of the graph, we update view.focus to that new top parent
                this.$emit('updateFocus', parent)
              } else {
                // if (parentProfile.children.length === 1) {
                //   parentProfile.children[0] = this.selectedProfile
                // }

                this.addParent({
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

              const profileSibling = await this.loadDescendants(child, '', [])

              profileSibling.parents[0] = this.selectedProfile.parents[0]

              // add child to parent
              this.addChild({
                child: profileSibling,
                parent: this.selectedProfile.parents[0]
              })
              break
            default:
              console.error('not built')
          }
        }

        // if (this.isActive('view-edit-node')) {
        //   const nestedWhakapapa = await this.loadDescendants(this.view.focus)
        //   // WARNING: this is going to set the top of the tree to this profile
        //   this.setNestedWhakapapa(nestedWhakapapa)
        // }
      } catch (err) {
        throw err
      }
    },

    async createChildLink (input) {
      input.type = 'link/profile-profile/child'
      input.recps = input.recps || this.view.recps
      // TODO check recps

      try {
        const res = await this.$apollo.mutate(saveLink(input))
        if (res.errors) {
          console.error('failed to createChildLink', res)
          return
        }
        return res // TODO return the linkId
      } catch (err) {
        throw err
      }
    },

    async updatePerson (input) {
      console.log('update profile: ', input)

      const profileId = this.selectedProfile.id
      if (this.isPersonalProfile(profileId)) {
        console.log()
        await this.saveCurrentIdentity(input)
      } else {
        await this.savePerson({ id: profileId, ...input })
      }

      const relationshipAttrs = pick(input, [...PERMITTED_RELATIONSHIP_ATTRS])
      if (!isEmpty(relationshipAttrs) && this.selectedProfile.id !== this.view.focus) {
        const relationship = this.selectedProfile.relationship
        let input = {
          type: 'link/profile-profile/child',
          linkId: relationship.linkId,
          child: relationship.child,
          parent: relationship.parent,
          ...relationshipAttrs
          // recps: this.view.recps
        }
        try {
          const linkRes = await this.$apollo.mutate(saveLink(input))
          if (linkRes.errors) {
            console.error('failed to update child link', linkRes)
            return
          } else {
            this.relationshipLinks.set(relationship.parent + '-' + relationship.child, input)
            this.selectedProfile.relationship = input
            let node = this.selectedProfile
            this.updateNode({
              node
            })
          }
        } catch (err) {
          console.log('error:', err)
          throw err
        }
      }

      if (this.storeDialog === 'edit-node') {
        if (this.source === 'new-registration') {
          this.close()
          return
        } else {
          this.setProfileById({
            id: profileId
          })
          return
        }
      }

      // reload the selectedProfiles personal details
      var node = await this.loadKnownFamily(true, this.selectedProfile)
      // apply the changes to the nestedWhakapapa
      if (this.selectedProfile.isPartner && this.selectedProfile.id !== this.focus) {
        this.updatePartnerNode(node)
      } else {
        this.updateNode({
          node
        })
      }

      // reorder children if there is a change in birthorder
      if (input.birthOrder) {
        var nestedParent = tree.find(this.nestedWhakapapa, this.selectedProfile.parents[0].id)
        nestedParent.children = nestedParent.children.sort((a, b) => {
          return a.birthOrder - b.birthOrder
        })
        this.updateNode({
          node: nestedParent
        })
      }

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
        id: this.$route.params.id,
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
            this.deleteNode(this.selectedProfile)
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

      const profileResult = await this.$apollo.mutate(savePerson(input))

      if (profileResult.errors) {
        console.error('failed to delete profile', profileResult)
        return
      }
      // if removing top ancestor on main whanau line, update the whakapapa view focus with child/partner
      if (this.selectedProfile.id === this.view.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('updateFocus', successor.id)

        // if removing top ancestor on a partner line show the new top ancestor
      } else if (this.selectedProfile.id === this.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('setFocus', successor.id)
      } else this.deleteNode(this.selectedProfile)
      this.setSelectedProfile(null)
    },

    async deleteCommunity () {
      const deleteTribeRes = await this.$apollo.mutate(deleteTribe(this.currentTribe))
      if (deleteTribeRes.errors) {
        console.error('failed to delete public profile', deleteTribeRes)
      } else {
        this.source = null
        this.setTribes()
        this.setComponent('profile')
        this.setProfileById({ id: this.whoami.personal.profile.id })
        this.$router.push({ name: 'profileShow', params: { id: this.whoami.personal.profile.id } }).catch(() => {})
        this.confirmationAlert('community successfully deleted')
        setTimeout(() => {
          this.confirmationText = null
          this.snackbar = !this.snackbar
        }, 3000)
      }
    },

    confirmationAlert (message) {
      this.confirmationText = message
      this.snackbar = !this.snackbar
    },

    async getSuggestions ($event) {
      if (!$event) {
        this.suggestions = []
        return
      }
      var records = await this.findByName($event)
      if (isEmpty(records)) {
        this.suggestions = []
        return
      }

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
        records = records.filter(record => {
          if (this.findInTree(record.id)) return false // dont include it
          return true
        })

        // hydrate all the left over records
        records = records.map(record => {
          return tree.hydrate(record, profiles) // needed to hydrate to fix all dates
        })
      }

      records = records.map(record => {
        let obj = {}
        let profile = record
        obj = {
          profile
        }
        return obj
      })
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
    },
    async findByName (name) {
      const request = {
        query: gql`
          query($name: String!) {
            findPersons(name: $name) {
              id
              preferredName
              legalName
              gender
              aliveInterval
              birthOrder
              description
              altNames
              avatarImage { uri }
              children {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  aliveInterval
                  birthOrder
                  description
                  altNames
                  avatarImage { uri }
                }
                relationshipType
              }
              parents {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  aliveInterval
                  birthOrder
                  description
                  altNames
                  avatarImage { uri }
                }
                relationshipType
              }
            }
          }
        `,
        variables: {
          name: name
        },
        fetchPolicy: 'no-cache'
      }

      try {
        const result = await this.$apollo.query(request)
        if (result.errors) {
          console.error('WARNING, something went wrong')
          console.error(result.errors)
          return
        }
        return result.data.findPersons
      } catch (e) {
        console.error('WARNING, something went wrong, caught it')
        console.error(e)
      }
    }
  }
}
</script>