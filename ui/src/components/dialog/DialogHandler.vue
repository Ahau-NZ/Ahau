<template>
  <div id="container">
    <ReviewRegistrationDialog
      v-if="isActive('review-registration')"
      :show="isActive('review-registration')"
      :title="t('reviewRegistrationTitle', {groupPreferredName: currentNotification.group.preferredName})"
      :notification="currentNotification"
      @close="close"
    />
    <!-- new submission dialog -->
    <ReviewSubmissionDialog
      v-if="isActive('review-submission')"
      :show="isActive('review-submission')"
      :notification="currentNotification"
      @close="close"
    />
    <!-- new submission dialog -->
    <NewCommunityDialog
      v-if="isActive('new-community')"
      :show="isActive('new-community')"
      :title="t('createCommunityTitle')"
      @submit="setupNewCommunity($event)"
      @close="close"
    />
    <NewPersonDialog
      v-if="isActive('new-person')"
      :show="isActive('new-person')"
      :title="newPersonDialogTitle"
      :type="dialogType"
      withView
      @create="isSubmitOnly ? submitPerson($event) : addPerson($event, dialogType)"
      @close="close"
    />
    <SideNodeDialog
      v-if="isActive('view-edit-person') && selectedProfile"
      :show="isActive('view-edit-person')"
      :profileId="selectedProfile.id"
      :deleteable="canDelete(selectedProfile)"
      :editing="dialogType === 'editing'"
      @close="close"
      @new="toggleDialog('new-person', $event, 'view-edit-person')"
      @delete="toggleDialog('delete-person', null, null)"
      @reload-whakapapa="reloadWhakapapa"
      :view="view"
      :preview="previewProfile"
    />
    <RemovePersonDialog
      v-if="isActive('delete-person')"
      :show="isActive('delete-person')"
      :profile="selectedProfile"
      :submit-only="isSubmitOnly"
      :warnAboutChildren="selectedProfile && selectedProfile.id !== focus"
      @submit="isSubmitOnly ? submitRemovePerson($event) : removeProfile($event)"
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
    <ComingSoonDialog
      v-if="isActive('coming-soon')"
      :show="isActive('coming-soon')" @close="close"
    />
  </div>
</template>

<script>
import { pick, isEmpty } from 'lodash-es'

import NewPersonDialog from '@/components/dialog/profile/NewPersonDialog.vue'
import NewCommunityDialog from '@/components/dialog/community/NewCommunityDialog.vue'
import SideNodeDialog from '@/components/dialog/profile/SideNodeDialog.vue'
import RemovePersonDialog from '@/components/dialog/profile/RemovePersonDialog.vue'
import WhakapapaViewDialog from '@/components/dialog/whakapapa/WhakapapaViewDialog.vue'
import WhakapapaEditDialog from '@/components/dialog/whakapapa/WhakapapaEditDialog.vue'
import WhakapapaDeleteDialog from '@/components/dialog/whakapapa/WhakapapaDeleteDialog.vue'
import WhakapapaShowHelper from '@/components/dialog/whakapapa/WhakapapaShowHelper.vue'
import WhakapapaTableHelper from '@/components/dialog/whakapapa/WhakapapaTableHelper.vue'
import ComingSoonDialog from '@/components/dialog/ComingSoonDialog.vue'
import ReviewRegistrationDialog from '@/components/dialog/registration/ReviewRegistrationDialog.vue'
// Importing review submission component
import ReviewSubmissionDialog from '@/components/dialog/submission/ReviewSubmissionDialog.vue'

import { getInitialCustomFieldChanges } from '@/lib/custom-field-helpers'
import { getDisplayName } from '@/lib/person-helpers'
import findSuccessor from '@/lib/find-successor'

import mapProfileMixins from '@/mixins/profile-mixins'
import { mapGetters, mapActions } from 'vuex'

import {
  ACCESS_KAITIAKI,
  LINK_TYPE_CHILD,
  LINK_TYPE_PARTNER,
  LINK_CHILD,
  LINK_PARENT,
  DELETE
  // IGNORE
} from '@/lib/constants'

export default {
  name: 'DialogHandler',
  components: {
    NewPersonDialog,
    SideNodeDialog,
    RemovePersonDialog,
    WhakapapaViewDialog,
    WhakapapaEditDialog,
    WhakapapaDeleteDialog,
    WhakapapaShowHelper,
    WhakapapaTableHelper,
    ComingSoonDialog,
    NewCommunityDialog,
    ReviewRegistrationDialog,
    ReviewSubmissionDialog
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
        'new-community', 'new-person', 'view-edit-person', 'delete-person', 'new-story', 'edit-story', 'delete-story',
        'whakapapa-view', 'whakapapa-edit', 'whakapapa-delete', 'whakapapa-helper', 'whakapapa-table-helper', 'review-registration', 'table-filter-menu'
      ].includes(val)
    },
    type: {
      type: String,
      default: null,
      validator: (val) => [
        'parent', 'child', 'sibling', 'partner', 'preview'
      ].includes(val)
    },
    loadKnownFamily: Function,
    getRelatives: Function
  },
  mixins: [
    mapProfileMixins({
      mapApollo: ['profile']
    })
  ],
  data () {
    return {
      source: null,
      registration: '',
      dialogType: '',
      profile: {}
    }
  },
  computed: {
    ...mapGetters(['whoami', 'storeDialog', 'storeType', 'currentAccess', 'isKaitiaki']),
    ...mapGetters('notifications', ['currentNotification']),
    ...mapGetters('person', ['selectedProfile']),
    ...mapGetters('tribe', ['currentTribe']),
    ...mapGetters('whakapapa', ['focus', 'getImportantRelationship']),
    ...mapGetters('whakapapa', { view: 'whakapapaView' }),
    ...mapGetters('tree', ['getParentNodeId', 'getNode', 'getPartnerNode', 'isInTree']),
    ...mapGetters('tribe', ['currentTribe', 'tribeCustomFields']),
    newPersonDialogTitle () {
      return this.dialogType === 'person'
        ? this.t('addPerson')
        : this.t('newPersonTitle', { dialogType: this.dialogType, displayName: getDisplayName(this.selectedProfile) })
    },
    isSubmitOnly () {
      return !this.isKaitiaki && this.view?.permission === 'submit'
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    previewProfile () {
      return this.storeType === 'preview' || this.type === 'preview'
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
    ...mapActions(['setDialog']),
    ...mapActions('profile', ['getProfile']),
    ...mapActions('alerts', ['showAlert']),
    ...mapActions('tribe', ['initGroup']),
    ...mapActions('person', [
      'createPerson',
      'loadPersonFull',
      'updatePerson',
      'deletePerson',
      'setSelectedProfileId',
      'personListAdd',
      'personListDelete',
      'personListUpdate'
    ]),
    ...mapActions('whakapapa', [
      'loadWhakapapaView',
      'saveWhakapapaView',
      'addLinks',
      'saveLink',
      'getLink',
      'removeLinksToProfile',
      'deleteProfileFromImportantRelationships'
    ]),
    ...mapActions('submissions', [
      'proposeNewGroupPerson',
      'proposeDeleteGroupPerson',
      'proposeNewWhakapapaLink',
      'proposeEditWhakapapaView',
      'createSubmissionsLink'
    ]),
    isActive (type) {
      return (type === this.dialog || type === this.storeDialog)
    },
    close () {
      if (this.isActive('new-person')) {
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
        this.setDialog({ active: dialog, type, source })
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
      if (this.view && this.view.id && profile.id === this.view.focus) {
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
    async addPerson (input, type) {
      let { id, children, parents, partners, moveDup, customFields: rawCustomFields = {} } = input

      // if moveDup is in input than add duplink
      if (moveDup !== undefined) {
        await this.addImportantRelationship(input)
        delete input.moveDup
      }

      // get children, parents, partners quick add links
      // remove them from input
      delete input.children
      delete input.parents
      delete input.partners

      // set the custom fields
      input.customFields = getInitialCustomFieldChanges(rawCustomFields[this.currentTribe.id], this.tribeCustomFields)
      if (isEmpty(input.customFields)) delete input.customFields

      const isNewProfile = !input.id
      if (isNewProfile) id = await this.createNewPerson(input)

      // if adding a person direct to database
      if (type && type === 'person') {
        // setSelectedProfile to trigger personIndex watcher and load person
        return this.personListAdd(id)
      }

      let isIgnoredProfile

      if (this.view && this.view.id) {
        isIgnoredProfile = this.view.ignoredProfiles.includes(id)
        if (isIgnoredProfile) await this.removeIgnoredProfile(id)
      }

      const relationshipAttrs = pick(input, ['relationshipType', 'legallyAdopted'])

      let child, parent, parentProfileId
      switch (this.dialogType) {
        case 'child':
        case 'sibling':
          child = id
          parentProfileId = this.dialogType === 'child'
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

          if (this.$route.name === 'personIndex') {
            this.personListAdd(child)
          }
          break

        case 'parent':
          child = this.selectedProfile.id
          parent = id

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
            const parentId = this.getParentNodeId(child)

            if (!parentId) {
              // when the child doesnt have a parent above them, load the new parents profile
              this.$emit('set-focus-to-ancestor-of', parent)
            }
          }
          // only update personList if we are on personIndex
          if (this.$route.name === 'personIndex') {
            this.personListAdd(parent)
          }
          break
        case 'partner':
          parent = this.selectedProfile.id
          child = id

          // create the link
          if (!isIgnoredProfile) await this.createPartnerLink({ parent, child })

          // Add children if children quick add links
          if (children) await this.quickAddChildren(id, children)
          if (this.$route.name === 'personIndex') {
            this.personListAdd(parent)
          }
          break
        default:
          console.error('wrong type for add person')
      }
    },
    async submitPerson (input) {
      const {
        id, // id of a profile, if the person we are adding already exists

        // for adding links to a person
        partners,
        children,
        parents,

        customFields: rawCustomFields = {},

        comment // attach a comment from the submitter, to the submission

        /* moveDup, */ // for moving a duplicate profile
      } = input

      // if moveDup is in input than add duplink
      // if (moveDup) {
      //   await this.addImportantRelationship(input)
      //   delete input.moveDup
      // }

      // here we only create a parent submission, if we need to create the profile
      // if there is an id, it means we are creating a link for an existing profile
      let parentSubmissionId
      if (!id) {
      // get children, parents, partners quick add links
      // remove them from input
        delete input.children
        delete input.parents
        delete input.partners

        // set the custom fields
        input.customFields = getInitialCustomFieldChanges(rawCustomFields[this.currentTribe.id], this.tribeCustomFields)
        if (isEmpty(input.customFields)) delete input.customFields
        parentSubmissionId = await this.submitNewPerson(input, comment)
      }

      // TODO: allow submissions to unignore a profile here
      // let isIgnoredProfile
      // if (this.view && this.view.id) {
      //   isIgnoredProfile = this.view.ignoredProfiles.includes(id)
      //   if (isIgnoredProfile) await this.removeIgnoredProfile(id)
      // }

      const relationshipAttrs = pick(input, ['relationshipType', 'legallyAdopted'])

      switch (this.dialogType) {
        case 'child':
        case 'sibling':
          // if (!isIgnoredProfile) {
          await this.submitNewLink({
            type: LINK_TYPE_CHILD,
            parent: (this.dialogType === 'child')
              ? this.selectedProfile.id
              : this.getParentNodeId(this.selectedProfile.id),

            // NOTE: id only has a value when we are creating a submission to link an existing profile
            child: id,
            relationshipAttrs
          }, parentSubmissionId, comment)
          // }

          if (parents) {
            await this.submitNewLinks({
              type: LINK_TYPE_CHILD,
              child: id
            }, parents, parentSubmissionId, comment)
          }

          break
        case 'parent':
          // if (!isIgnoredProfile) {
          await this.submitNewLink({
            type: LINK_TYPE_CHILD,
            child: this.selectedProfile.id,

            // NOTE: id only has a value when we are creating a submission to link an existing profile
            parent: id,
            relationshipAttrs
          }, parentSubmissionId, comment)
          // }

          if (partners) {
            await this.submitNewLinks({
              type: LINK_TYPE_PARTNER,
              parent: id
            }, partners, parentSubmissionId, comment)
          }

          if (children) {
            await this.submitNewLinks({
              type: LINK_TYPE_CHILD,
              parent: id
            }, children, parentSubmissionId, comment)
          }

          break
        case 'partner':
          // if (!isIgnoredProfile) {
          await this.submitNewLink({
            type: LINK_TYPE_PARTNER,
            parent: this.selectedProfile.id,

            // NOTE: id only has a value when we are creating a submission to link an existing profile
            child: id
          }, parentSubmissionId, comment)
          // }

          if (children) {
            await this.submitNewLinks({
              type: LINK_TYPE_CHILD,
              // NOTE: id only has a value when we are creating a submission to link an existing profile
              parent: id
            }, children, parentSubmissionId, comment)
          }

          // NOTE: for quick added links, there is no parent submission, so each link will be a separate submission

          break
        default:
          console.error('wrong type for add person')
      }
    },
    async submitRemovePerson ({ action, comment }) {
      if (action === DELETE) {
        return this.proposeDeleteGroupPerson({
          profileId: this.selectedProfile.id,
          comment
        })
      }

      // action === IGNORE
      return this.proposeEditWhakapapaView({
        whakapapaId: this.$route.params.whakapapaId,
        input: {
          ignoredProfiles: {
            add: [this.selectedProfile.id]
          }
        },
        comment
      })
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
    async submitNewPerson (input, comment) {
      input.type = this.currentAccess.type === ACCESS_KAITIAKI ? 'person/admin' : 'person'
      input.authors = {
        add: [
          input.recps.includes(this.whoami.personal.groupId) // if its my personal group
            ? this.whoami.public.feedId // allow edits from only my feedId
            : '*' // otherwise allow all authors
        ]
      }

      // make the submission
      return this.proposeNewGroupPerson({ input, comment })
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
        type: LINK_TYPE_CHILD,
        child,
        parent,
        recps: this.view.recps || [this.currentTribe.id],
        ...relationshipAttrs
      })
        .then(() => {
          this.addLinks({ childLinks: [{ parent, child, ...relationshipAttrs }] })
        })
    },
    async submitNewLink ({ type, parent, child, relationshipAttrs = {} }, parentSubmissionId, comment) {
      const submissionId = await this.proposeNewWhakapapaLink({
        input: {
          type,
          parent,
          child,
          ...relationshipAttrs
        },
        comment
      })

      // if there isnt a parentSubmissionId, then we arent linking this submission to anything
      if (!parentSubmissionId) {
        this.showAlert({
          message: 'Your submission has been sent for review',
          delay: 7000,
          color: 'green'
        })

        return
      }

      await this.createSubmissionsLink({
        parent: parentSubmissionId,
        child: submissionId,
        mappedDependencies: [{
          missingField: parent === undefined ? LINK_PARENT : LINK_CHILD,
          replacementField: 'targetId'
        }]
      })
    },
    async submitNewLinks ({ type, parent, child }, links, parentSubmissionId, comment) {
      if (!type) {
        console.error('submitNewLinks is missing the type')
        return
      } else if (parent && child) {
        console.error('submitNewLinks found both a parent and child id, it should only have one')
        return
      }

      return Promise.all(
        links.map(link => {
          const input = {
            type,
            parent: parent || link.id,
            child: child || link.id,
            relationshipAttrs: type === LINK_TYPE_CHILD ? pick(link, ['relationshipType', 'legallyAdopted']) : undefined
          }

          return this.submitNewLink(input, parentSubmissionId, comment)
        })
      )
    },
    async createPartnerLink ({ child, parent }) {
      return this.saveLink({
        type: LINK_TYPE_PARTNER,
        child,
        parent,
        recps: this.view.recps || [this.currentTribe.id]
      })
        .then(() => this.addLinks({ partnerLinks: [{ parent, child }] }))
    },
    async removeProfile (deleteOrIgnore) {
      const id = this.selectedProfile.id
      await this.deleteProfileFromImportantRelationships(id)
      if (deleteOrIgnore === 'delete') await this.processDeletePerson()
      else await this.ignoreProfile()
      if (this.$route.name === 'personIndex') {
        this.personListDelete(id)
      }
    },

    // TODO 2022-03-12 mix - move to vuex?
    async addImportantRelationship (input) {
      // Check if we are moving a partner connection
      const profile = (input.moveDup || this.dialogType === 'child') ? input : this.selectedProfile

      // check if there is already an existing important relationship
      const existingDupe = this.getImportantRelationship(profile.id)
      let lessRelationship

      if (existingDupe) {
        // YES - there is an important relationship so we use that one instead
        lessRelationship = existingDupe.primary.profileId
      } else {
        // NO - there isnt an important relationship so we find the parent which takes "presidence"
        lessRelationship = (profile.parents && profile.parents.length && this.isInTree(profile.parents[0].id))
          ? profile.parents[0].id // take the first parent
          : profile.partners && profile.partners.length
            ? profile.partners[0].id // otherwise take the first partner? TODO: is this logic right @ben? Need to check!
            : null

        if (!lessRelationship) return
      }

      const importantRelationship = {
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

      this.setSelectedProfileId(null)
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
      this.setSelectedProfileId(null)
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
