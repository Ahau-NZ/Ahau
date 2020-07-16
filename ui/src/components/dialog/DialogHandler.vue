<template>
  <div id="container">
    <NewRegistrationDialog
      v-if="isActive('new-registration')"
      :show="isActive('new-registration')"
      :profile="whoami.profile"
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
      @create="addCommunity($event)"
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
    <EditNodeDialog v-if="isActive('edit-node')"
      :show="isActive('edit-node')"
      :title="source === 'new-registration' ? `Edit ${registration.preferredName}`:`Edit ${currentProfile.preferredName}`"
      @submit="updateProfile($event)"
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
      @submit="updateProfile($event)"
      @delete="toggleDialog('delete-node', null, null)"
      @open-profile="setSelectedProfile($event)"
      :view="view"
      :preview ="previewProfile"
    />
    <DeleteNodeDialog v-if="isActive('delete-node')"
      :show="isActive('delete-node')"
      :profile="selectedProfile"
      :warnAboutChildren="selectedProfile && selectedProfile.id !== nestedWhakapapa.id"
      @submit="removeProfile"
      @close="close"
    />
    <WhakapapaViewDialog v-if="isActive('whakapapa-view')"
      :show="isActive('whakapapa-view')"
      :view="view"
      @edit="toggleDialog('whakapapa-edit', null, 'whakapapa-view')"
      @close="close"
    />
    <WhakapapaEditDialog v-if="isActive('whakapapa-edit')"
      :show="isActive('whakapapa-edit')"
      :view="view"
      @delete="toggleDialog('whakapapa-delete', null, 'whakapapa-edit')"
      @close="close"
      @submit="$emit('updateWhakapapa', $event)"
    />
    <WhakapapaDeleteDialog v-if="isActive('whakapapa-delete')"
      :show="isActive('whakapapa-delete')"
      :view="view" @close="close"
      @submit="$emit('deleteWhakapapa')"
    />
    <WhakapapaShowHelper
      :show="isActive('whakapapa-helper')"
      :title="`Whakapapa ---- Family tree`"
      @close="close"
    />
    <WhakapapaTableHelper
      :show="isActive('whakapapa-table-helper')"
      :title="`Whakapapa registry`"
      @close="close"
    />
    <!-- <NewCollectionDialog
      :show="isActive('new-collection')"
      :title="'Create a new Collection'"
      @close="close"
      @submit="console.log('TODO: add collection to profile')"
    /> -->
    <ComingSoonDialog
      :show="isActive('coming-soon')"
      @close="close"
    />
    <ConfirmationMessage :show="snackbar" :message="confirmationText" />

    <!-- <v-snackbar v-model="snackbar" >
      {{ confirmationText }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar> -->

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

import { PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS, saveProfile } from '@/lib/profile-helpers.js'

import { SAVE_LINK } from '@/lib/link-helpers.js'
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'

import findSuccessor from '@/lib/find-successor'

import { PERMITTED_COMMUNITY_ATTRS } from '@/lib/community-helpers'

import tree from '@/lib/tree-helpers'

import * as d3 from 'd3'
import {
  mapGetters,
  mapActions
} from 'vuex'

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
    ...mapGetters(['nestedWhakapapa', 'selectedProfile', 'whoami', 'storeDialog', 'storeType', 'storeSource', 'currentProfile']),
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
    ...mapActions(['updateNode', 'deleteNode', 'updatePartnerNode', 'addChild', 'addParent', 'loading', 'setDialog',
      'setProfileById'
    ]),
    addGrandparentToRegistartion (grandparent) {
      var parent = this.parents[this.parentIndex]
      if (parent.grandparents) {
        console.log('grandparents detected')
        parent.grandparents.push(grandparent)
        console.log('new grandparent added: ', parent)
      } else {
        console.log(parent.preferredName, 'currently no granparents detected')

        parent = {
          ...parent,
          grandparents: [grandparent]
        }
        console.log('grandparents added: ', parent)
      }
      console.log('parent index: ', this.parentIndex)
      this.parents.splice(this.parentIndex, 1, parent)
      console.log(this.parents)
    },
    addParentToRegistration (parent) {
      console.log('add parent: ', parent)
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
      console.log('can delete: ', profile)
      if (!profile) return false
      if (this.previewProfile) return false

      // not allowed to delete own profile
      if (profile.id === this.whoami.profile.id) return false

      // if deleting the focus (top ancestor)
      if (this.view && profile.id === this.view.focus) {
        // can only proceed if can find a clear "successor" to be new focus
        return Boolean(findSuccessor(profile))
      }
      return true
    },
    async addCommunity ($event) {
      console.log($event)
      // if person doesnt exisit create one
      if (!$event.id) {
        const id = await this.createProfile($event)
        console.log('res: ', id)
        if (id) {
          this.$router.push({ name: 'profileShow', params: { id: id } })
        }
      }
    },
    async createProfile ({
      type,
      preferredName,
      legalName,
      gender,
      bornAt,
      diedAt,
      birthOrder,
      avatarImage,
      altNames,
      description,
      address,
      location,
      profession,
      email,
      phone,
      deceased,
      aliveInterval
    }) {
      console.log('creating person: ', preferredName, gender)
      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            type,
            preferredName,
            legalName,
            gender,
            bornAt,
            diedAt,
            birthOrder,
            avatarImage,
            altNames,
            description,
            location,
            profession,
            address,
            email,
            phone,
            deceased,
            aliveInterval,
            // UPDATE : for private groups
            recps: type === 'community' ? [this.whoami.feedId] : this.view.recps
          }
        }
      })

      if (res.errors) {
        console.error('failed to createProfile', res)
        return
      }
      return res.data.saveProfile // a profileId
    },
    async addPerson ($event) {
      try {
        var {
          id
        } = $event

        if (this.view.ignoredProfiles.includes(id)) {
          const input = {
            id: this.$route.params.id,
            ignoredProfiles: {
              remove: [id]
            }
          }
          try {
            const res = await this.$apollo.mutate({
              mutation: gql`
              mutation($input: WhakapapaViewInput) {
                saveWhakapapaView(input: $input)
              }
              `,
              variables: {
                input
              }
            })
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
          // if person doesnt exisit create one
          if (!id) {
            id = await this.createProfile($event)
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

    async createChildLink ({
      child,
      parent,
      relationshipType,
      legallyAdopted
    },
    view
    ) {
      const input = {
        type: 'link/profile-profile/child',
        child,
        parent,
        relationshipType,
        legallyAdopted,
        recps: this.view ? this.view.recps : [this.whoami.feedId]
      }
      try {
        const res = await this.$apollo.mutate(SAVE_LINK(input))
        if (res.errors) {
          console.error('failed to createChildLink', res)
          return
        }
        return res // TODO return the linkId
      } catch (err) {
        throw err
      }
    },
    async updateCommunity ($event) {
      console.log('updateCommunity', $event)
      Object.entries($event).map(([key, value]) => {
        if (value === '') {
          delete $event[key]
        }
      })

      const profileChanges = pick($event, [...PERMITTED_COMMUNITY_ATTRS])
      const profileId = this.selectedProfile.id

      let input = {
        id: profileId,
        ...profileChanges
      }

      const res = await this.$apollo.mutate(saveProfile(input))
      if (res.errors) {
        console.error('failed to update profile', res)
        return
      }
      if (this.storeDialog === 'edit-community') {
        this.setProfileById({
          id: res.data.saveProfile
        })
      }
    },
    async updateProfile ($event) {
      console.log('update profile: ', $event)
      // When do we need this?
      // Object.entries($event).map(([key, value]) => {
      //   if (value === '') {
      //     delete $event[key]
      //   }
      // })

      const profileChanges = pick($event, [...PERMITTED_PROFILE_ATTRS])
      const relationshipAttrs = pick($event, [...PERMITTED_RELATIONSHIP_ATTRS])
      const profileId = this.selectedProfile.id

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
          const linkRes = await this.$apollo.mutate(SAVE_LINK(input))
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

      let input = {
        id: profileId,
        ...profileChanges
      }
      const res = await this.$apollo.mutate(saveProfile(input))
      if (res.errors) {
        console.error('failed to update profile', res)
        return
      }
      if (this.storeDialog === 'edit-node') {
        if (this.source === 'new-registration') {
          this.close()
          return
        } else {
          this.setProfileById({
            id: res.data.saveProfile
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
      if (profileChanges.birthOrder) {
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
        await this.deleteProfile()
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
        const res = await this.$apollo.mutate({
          mutation: gql`
          mutation($input: WhakapapaViewInput) {
            saveWhakapapaView(input: $input)
          }
          `,
          variables: {
            input
          }
        })
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
    async deleteProfile () {
      if (!this.canDelete(this.selectedProfile)) return

      const profileResult = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.selectedProfile.id,
            tombstone: {
              date: new Date()
            }
          }
        }
      })
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
      const profileResult = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.selectedProfile.id,
            tombstone: {
              date: new Date()
            }
          }
        }
      })
      if (profileResult.errors) {
        console.error('failed to delete profile', profileResult)
      } else {
        this.$router.push({ name: 'profileShow', params: { id: this.whoami.profile.id } })
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
      console.log('search for this: ', $event)
      var records = await this.findByName($event)

      console.log('record: ', records)

      if (isEmpty(records)) {
        this.suggestions = []
        return
      }

      if (this.source !== 'new-registration') {
        var profiles = {} // flatStore for these suggestions

        records.forEach(record => {
          record.children = record.children.map(child => {
            console.log('mapping children')
            profiles[child.profile.id] = child.profile // add this records children to the flatStore
            return child.profile.id // only want the childs ID
          })
          record.parents = record.parents.map(parent => {
            console.log('mapping parents')
            profiles[parent.profile.id] = parent.profile // add this records parents to the flatStore
            return parent.profile.id // only want the parents ID
          })
          profiles[record.id] = record // add this record to the flatStore
        })

        // now we have the flatStore for the suggestions we need to filter out the records
        // so we cant add one that is already in the tree
        records = records.filter(record => {
          console.log('searching in tree')
          if (this.findInTree(record.id)) return false // dont include it
          return true
        })

        // hydrate all the left over records
        records = records.map(record => {
          console.log('hydrating')
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
      var end = Object.assign([], records)
      console.log('end results: ', end)
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
