<template>
  <div id="container">
    <NewNodeDialog v-if="isActive('new-node')"
      :show="isActive('new-node')"
      :title="`Add ${type} to ${selectedProfile.preferredName}`"
      @create="addPerson($event)"
      @close="close"
      :suggestions="suggestions" @getSuggestions="getSuggestions($event)"
    />
    <div :class="sideMenuClass">
      <SideViewEditNodeDialog
        v-if="isActive('view-edit-node')"
        :show="isActive('view-edit-node')"
        :profile="selectedProfile"
        :deleteable="canDelete(selectedProfile)"
        :warnAboutChildren="selectedProfile && selectedProfile.id !== view.focus"
        :sideMenu="true"
        @close="close"
        @new="toggleDialog('new-node', $event, 'view-edit-node')"
        @submit="updateProfile($event)"
        @delete="toggleDialog('delete-node', null, null)"
        @open-profile="$emit('set', $event)"
      />
    </div>
    <DeleteNodeDialog v-if="isActive('delete-node')"
      :show="isActive('delete-node')"
      :profile="selectedProfile"
      :warnAboutChildren="selectedProfile && selectedProfile.id !== view.focus"
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
  </div>
</template>

<script>
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'
import SideViewEditNodeDialog from '@/components/dialog/profile/SideViewEditNodeDialog.vue'
import DeleteNodeDialog from '@/components/dialog/profile/DeleteNodeDialog.vue'
import WhakapapaViewDialog from '@/components/dialog/whakapapa/WhakapapaViewDialog.vue'
import WhakapapaEditDialog from '@/components/dialog/whakapapa/WhakapapaEditDialog.vue'
import WhakapapaDeleteDialog from '@/components/dialog/whakapapa/WhakapapaDeleteDialog.vue'
import WhakapapaShowHelper from '@/components/dialog/whakapapa/WhakapapaShowHelper.vue'
import WhakapapaTableHelper from '@/components/dialog/whakapapa/WhakapapaTableHelper.vue'

import gql from 'graphql-tag'
import { whoami } from '@/lib/profile-helpers.js'
import { saveWhakapapaLink } from '@/lib/link-helpers.js'
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'

import findSuccessor from '@/lib/find-successor'

import { PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/profile-helpers'
import tree from '@/lib/tree-helpers'

import * as d3 from 'd3'

export default {
  name: 'DialogHandler',
  components: {
    NewNodeDialog,
    SideViewEditNodeDialog,
    DeleteNodeDialog,
    WhakapapaViewDialog,
    WhakapapaEditDialog,
    WhakapapaDeleteDialog,
    WhakapapaShowHelper,
    WhakapapaTableHelper
  },
  props: {
    selectedProfile: {
      type: Object
    },
    view: {
      type: Object
    },
    nestedWhakapapa: {
      type: Object
    },
    profiles: {
      type: Object
    },
    dialog: {
      type: String,
      required: false,
      default: null,
      validator: (val) => [
        'new-node', 'view-edit-node', 'delete-node',
        'whakapapa-view', 'whakapapa-edit', 'whakapapa-delete', 'whakapapa-helper', 'whakapapa-table-helper'
      ].includes(val)
    },
    type: {
      type: String,
      default: null,
      validator: (val) => [
        'parent', 'child'
      ].includes(val)
    }
  },
  data () {
    return {
      suggestions: [],
      source: null,
      whoami: {
        profile: { id: '' }
      }
    }
  },
  apollo: {
    whoami: whoami
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    sideMenuClass () {
      if (this.isActive('view-edit-node')) {
        return !this.mobile ? 'viewDesktop' : 'viewMobile'
      }
      return !this.mobile ? 'hideViewDesktop' : 'hideViewMobile'
    }
  },
  methods: {
    isActive (type) {
      if (type === this.dialog) {
        return true
      }
      return false
    },
    close () {
      if (this.isActive('new-node')) {
        this.toggleDialog(this.source, this.type, null)
        return
      }
      this.toggleDialog(this.source, null, null)
    },
    toggleDialog (dialog, type, source) {
      this.source = source
      this.$emit('update:dialog', dialog)
      this.$emit('update:type', type)
    },
    canDelete (profile) {
      if (!profile) return false

      // not allowed to delete own profile
      if (profile.id === this.whoami.profile.id) return false

      // if deleting the focus (top ancestor)
      if (profile.id === this.view.focus) {
        // can only proceed if can find a clear "successor" to be new focus
        return Boolean(findSuccessor(profile))
      }
      return true
    },
    async addPerson ($event) {
      try {
        var { id } = $event

        if (!id) {
          id = await this.createProfile($event)
          if (!id) return
        }

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
              variables: { input }
            })
            if (res.data) {
              this.$emit('refreshWhakapapa')
              if (this.isActive('view-edit-node')) {
                this.$emit('set', this.selectedProfile.id)
              }
              return
            } else {
              console.error(res)
            }
          } catch (err) {
            throw err
          }
        }

        let child, parent
        const relationshipAttrs = pick($event, [
          'relationshipType',
          'legallyAdopted'
        ])
        switch (this.type) {
          case 'child':
            child = id
            parent = this.selectedProfile.id

            if (this.selectedProfile.children) {
              const childrenExists = this.selectedProfile.children.filter(existingChild => {
                return existingChild.id === child
              })

              if (isEmpty(childrenExists)) {
                await this.createChildLink({ child, parent, ...relationshipAttrs })
              }
            }
            this.$emit('load', parent)
            break
          case 'parent':
            child = this.selectedProfile.id
            parent = id

            // check the child doesnt already have a link
            if (this.selectedProfile.parents) {
              const parentExists = this.selectedProfile.parents.filter(existingParent => {
                return existingParent.id === parent
              })

              if (isEmpty(parentExists)) {
                // dont want to create a new link
                await this.createChildLink({ child, parent, ...relationshipAttrs })
              }
            }
            if (child === this.view.focus) {
              // in this case we're updating the top of the graph, we update view.focus to that new top parent
              this.$emit('updateFocus', parent)
            // load new parent on partner whakapapa links
            } else if (!parent.parent) {
              this.$emit('change-focus', parent)
            } else {
              await this.$emit('load', child)
            }
            break
          default:
            console.log('not built')
        }

        if (this.isActive('view-edit-node')) {
          this.$emit('set', this.selectedProfile.id)
        }
      } catch (err) {
        throw err
      }
    },
    async createProfile ({
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
      contact
    }) {
      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            type: 'person',
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
            contact,
            recps: this.view.recps
          }
        }
      })

      if (res.errors) {
        console.error('failed to createProfile', res)
        return
      }
      return res.data.saveProfile // a profileId
    },
    async createChildLink (
      { child, parent, relationshipType, legallyAdopted },
      view
    ) {
      const input = {
        child,
        parent,
        relationshipType,
        legallyAdopted,
        recps: this.view.recps
      }
      try {
        const res = await this.$apollo.mutate(saveWhakapapaLink(input))
        if (res.errors) {
          console.error('failed to createChildLink', res)
          return
        }
        return res // TODO return the linkId
      } catch (err) {
        throw err
      }
    },
    async updateProfile ($event) {
      const profileChanges = pick($event, [...PERMITTED_PROFILE_ATTRS])
      const relationshipAttrs = pick($event, [...PERMITTED_RELATIONSHIP_ATTRS])
      const profileId = this.selectedProfile.id

      if (!isEmpty(relationshipAttrs) && this.selectedProfile.id !== this.view.focus) {
        const input = {
          relationshipId: this.selectedProfile.relationship.relationshipId,
          child: profileId,
          parent: this.selectedProfile.relationship.parent,
          ...relationshipAttrs,
          recps: this.view.recps
        }
        try {
          const linkRes = await this.$apollo.mutate(saveWhakapapaLink(input))
          if (linkRes.errors) {
            console.error('failed to update child link', linkRes)
            return
          }
          this.$emit('load', this.selectedProfile.relationship.parent)
        } catch (err) {
          throw err
        }
      }

      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: profileId,
            ...profileChanges
          }
        }
      })
      if (res.errors) {
        console.error('failed to update profile', res)
        return
      }
      await this.$emit('load', profileId)
      this.$emit('set', profileId)
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
          variables: { input }
        })
        if (res.data) {
          this.$emit('refreshWhakapapa')
        } else {
          console.error(res)
        }
      } catch (err) {
        throw err
      }
    },
    async deleteProfile () {
      if (!this.canDelete(this.selectedProfile)) return

      if (this.selectedProfile.id === this.view.focus) {
        const successor = findSuccessor(this.selectedProfile)
        this.$emit('updateFocus', successor.id)
      }

      const profileResult = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.selectedProfile.id,
            tombstone: { date: new Date() }
          }
        }
      })

      if (profileResult.errors) {
        console.error('failed to delete profile', profileResult)
        return
      }

      this.$emit('update:profiles', {})
      this.$emit('load', this.view.focus)
      // TODO - find a smaller subset to reload!
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
        if (this.findInTree(record.id)) {
          return false // dont include it
        }
        return true
      })

      // hydrate all the left over records
      records = records.map(record => {
        return tree.hydrate(record, profiles) // needed to hydrate to fix all dates
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
              bornAt
              diedAt
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
                  bornAt
                  diedAt
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
                  bornAt
                  diedAt
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

<style scoped>
.viewDesktop {
  transition: all 0.1s ease-in-out;
  position: absolute;
  top: 0px;
  right: 0px;
  width: 25%;
  height: 100%;
  background-color: white;
}

.hideViewDesktop {
  right: -30%;
}

.hideViewMobile {
  bottom: -100%;
}

.viewMobile {
  transition: all 0.1s ease-in-out;
  position: absolute;
  top: 0px;
  right: 0px;
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>
