<template>
  <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >

    <!-- Content Slot -->
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="py-0 px-0">

        <ProfileForm
          :isUser="isUser"
          :profile.sync="formData"
          :readonly="hasSelection"
          :withRelationships="allowRelationships"
          :dialogType="type"
          :mobile="mobile"
          :displayName="getDisplayName(selectedProfile)"
          :isDuplicate="isDuplicate"
          :moveDup.sync="moveDup"
        >

          <!-- Slot = Search -->
          <template v-slot:search>
            <v-combobox
              v-model="formData.preferredName"
              :items="generateSuggestions"
              item-value="id"
              item-text="id"
              :label="t('firstName')"
              :menu-props="{ light: true }"
              :clearable="hasSelection"
              append-icon=""
              v-bind="customProps"
              :search-input.sync="formData.preferredName"
              :readonly="hasSelection"
              :outlined="!hasSelection"
              autofocus
              @click:clear="resetFormData()"
              @blur.native="clearSuggestions"
            >

              <!-- Slot:item = Data -->
              <template v-slot:item="data">
                <template v-if="typeof data.item === 'object'">
                  <v-list-item @click="setFormData(data.item)">
                    <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :aliveInterval="data.item.aliveInterval" />
                    <v-list-item-content v-if="data.item.preferredName">
                      <v-list-item-title> {{ data.item.preferredName }} </v-list-item-title>
                      <v-list-item-subtitle>{{ t('preferredName') }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content v-if="data.item.legalName">
                      <v-list-item-title> {{ data.item.legalName }} </v-list-item-title>
                      <v-list-item-subtitle>{{ t('fullName') }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content v-if="!data.item.preferredName && !data.item.legalName">
                      <v-list-item-title>{{ t('unknown') }}</v-list-item-title>
                      <v-list-item-subtitle>{{ t('fullName') }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action v-if="age(data.item.aliveInterval)">
                      <v-list-item-title> {{ age(data.item.aliveInterval) }} </v-list-item-title>
                      <v-list-item-subtitle>{{ t('age') }}</v-list-item-subtitle>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </template>
            </v-combobox>
          </template>

          <template v-slot:addParents>
            <v-col cols="12" :class="mobile ? 'px-0':'py-0'" v-if="hasProfiles('parents')">
              <ProfileList
                :label="t('addParent')"
                :addedProfiles.sync="quickAdd.newParents"
                :items="generateParents"
                :groupType="type === 'sibling' ? 'parents-siblings': ''"
                @profile-click="updateQuickAdd($event, 'newParents')"
                @related-by="updateRelationships($event, 'newParents')"
              />
            </v-col>
          </template>
          <template v-slot:addChildren>
            <v-col cols="12" v-if="hasProfiles('children')">
              <ProfileList
                :label="t('addChildren')"
                :addedProfiles.sync="quickAdd.newChildren"
                :items="generateChildren"
                @profile-click="updateQuickAdd($event, 'newChildren')"
                @related-by="updateRelationships($event, 'newChildren')"
              />
            </v-col>
          </template>
          <template v-slot:addPartners>
            <v-col cols="12" v-if="hasProfiles('partners')">
              <ProfileList
                :label="t('addPartners')"
                :addedProfiles.sync="quickAdd.newPartners"
                :items="generatePartners"
                @profile-click="updateQuickAdd($event, 'newPartners')"
              />
            </v-col>
          </template>
        </ProfileForm>

      </v-col>
    </template>
    <template v-slot:before-actions>
      <AccessButton v-if="currentAccess" :accessOptions="[currentAccess]" type="person" disabled/>
    </template>
  </Dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'

import Dialog from '@/components/dialog/Dialog.vue'

import ProfileForm from '@/components/profile/ProfileForm.vue'
import ProfileList from '@/components/profile/ProfileList.vue'
import Avatar from '@/components/Avatar.vue'
import AccessButton from '@/components/button/AccessButton.vue'

import calculateAge from '@/lib/calculate-age'
import { PERMITTED_PERSON_ATTRS, PERMITTED_RELATIONSHIP_ATTRS, getDisplayName, setPersonProfile, setDefaultData } from '@/lib/person-helpers'
import { parseInterval } from '@/lib/date-helpers.js'

export default {
  name: 'NewNodeDialog',
  components: {
    Avatar,
    Dialog,
    ProfileForm,
    AccessButton,
    ProfileList
  },
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Create a new person' },
    suggestions: Array,
    hideDetails: Boolean,
    selectedProfile: Object,
    withView: { type: Boolean, default: true },
    isUser: { type: Boolean, default: false },
    type: {
      type: String,
      validator: (val) => [
        'child', 'parent', 'sibling', 'partner'
      ].includes(val)
    },
    findInTree: Function
  },
  data () {
    return {
      formData: setDefaultData(this.allowRelationships),
      hasSelection: false, // TODO - describe what this does
      closeSuggestions: [],
      profile: {}, // the profile state in the form
      quickAdd: {
        parents: [],
        children: [],
        partners: [],
        newParents: [],
        newChildren: [],
        newPartners: []
      },
      existingProfile: null, // the currently profile in database (if it exists)
      isDuplicate: false,
      moveDup: true
    }
  },
  async mounted () {
    this.closeSuggestions = await this.getCloseSuggestions()

    if (this.$route.name !== 'login' && this.selectedProfile) {
      this.quickAdd.parents = await this.newChildParents(this.selectedProfile)
      this.quickAdd.partners = this.selectedProfile.parents

      if (this.type === 'partner') this.quickAdd.children = this.newPartnerChildren(this.selectedProfile)
      else if (this.type === 'parent') this.quickAdd.children = this.newParentChildren(this.selectedProfile)
    }
  },
  computed: {
    ...mapGetters(['currentAccess']),
    allowRelationships () {
      return this.type && this.type !== 'partner' && (this.profile.relationshipType == null)
    },
    generateSuggestions () {
      if (this.hasSelection) return []

      let otherSuggestions = []
      let closeSuggestions = []

      if (this.suggestions && this.suggestions.length > 0) {
        otherSuggestions = [
          this.type ? { header: 'Are you looking for:' } : null,
          ...this.suggestions
        ]
      }
      if (this.closeSuggestions && this.closeSuggestions.length > 0 && this.suggestions.length < 1) {
        closeSuggestions = [
          this.header,
          ...this.closeSuggestions,
          this.divider
        ]
      }

      return [
        ...closeSuggestions,
        ...otherSuggestions
      ].filter(Boolean)
    },
    generateParents () {
      return this.getSuggestionsByField('parents')
    },
    generateChildren () {
      return this.getSuggestionsByField('children')
    },
    generatePartners () {
      return this.getSuggestionsByField('partners')
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    customProps () {
      return {
        readonly: this.hasSelection,
        hideDetails: true,
        placeholder: ' ',
        class: this.hasSelection ? 'custom' : ''
      }
    },
    divider () {
      return this.type ? { divider: true } : null
    },
    header () {
      switch (this.type) {
        case 'child': return { header: 'Suggested children' }
        case 'parent': return { header: 'Suggested parents' }
        case 'partner': return { header: 'Suggested partners' }
        default: return null
      }
    },
    submission () {
      let submission = {}
      Object.entries(this.formData).map(([key, value]) => {
        if (!isEmpty(this.formData[key])) {
          switch (key) {
            case 'birthOrder':
              submission[key] = parseInt(value)
              break
            case 'altNames':
              if (!isEmpty(this.formData[key].add)) {
                submission[key] = value
              }
              break
            case 'aliveInterval':
              submission[key] = parseInterval(this.formData.aliveInterval)
              break
            default:
              submission[key] = value
          }
        } else if (key === 'deceased') {
          submission[key] = value
        }
      })

      return submission
    }
  },
  methods: {
    ...mapActions('whakapapa', ['suggestedChildren', 'suggestedParents']),
    ...mapActions('profile', ['getProfile']),
    getDisplayName,
    updateRelationships (profile, selectedArray) {
      const index = this.quickAdd[selectedArray].findIndex(x => x.id === profile.id)
      this.quickAdd[selectedArray][index].relationshipType = profile.relationshipType
    },
    updateQuickAdd (profile, selectedArray) {
      const isAlreadyQuickAdded = this.quickAdd[selectedArray].some(d => d.id === profile.id)
      if (isAlreadyQuickAdded) {
        // remove from selectedArray
        this.quickAdd[selectedArray] = this.quickAdd[selectedArray].filter(d => d.id !== profile.id)
      } // eslint-disable-line
      else {
        // add to selectedArray
        const details = pick(profile, ['id', 'relationshipType', 'legallyAdopted'])
        this.quickAdd[selectedArray].push(details)
      }
    },
    hasProfiles (field) {
      return this.quickAdd[field] && this.quickAdd[field].length > 0
    },
    getSuggestionsByField (field) {
      if (!this.hasProfiles(field)) return []

      const filterSelection = (profile) => {
        if (!profile) return false
        return profile.id !== this.profile.id
      }

      return this.quickAdd[field]
        .filter(filterSelection)
    },
    clearSuggestions () {
      this.$emit('getSuggestions', null)
    },
    getCloseSuggestions () {
      switch (this.type) {
        case 'child':
          return this.suggestedChildren(this.selectedProfile.id)
        case 'parent':
          return this.suggestedParents(this.selectedProfile.id)
        case 'partner':
          return this.findPartners()
        default:
          return []
      }
    },
    newChildParents (profile) {
      var currentPartners = []

      if (this.type === 'child' && profile.partners) {
        profile.partners.forEach(d => {
          currentPartners.push(d)
        })
      }
      if (this.type === 'sibling' && profile.parents) {
        profile.parents.forEach(d => {
          currentPartners.push(d)
        })
      }

      return currentPartners
    },

    newPartnerChildren (profile) {
      return profile.children || []
    },

    newParentChildren (profile) {
      return profile.siblings || []
    },

    find (array, item) {
      return array.some(i => i.id === item.id)
    },

    // suggests other parents of children
    async findPartners () {
      var currentPartners = this.selectedProfile.partners || []

      var suggestedPartners = []

      this.selectedProfile.children.map(child => {
        if (!child.parents) return child

        child.parents.forEach(parent => {
          if (this.selectedProfile.id === parent.id) return
          if (!this.find(currentPartners, parent) && !this.find(suggestedPartners, parent)) {
            suggestedPartners.push(parent)
          }
        })
        return child
      })

      // get ignored parents
      const profile = await this.getProfile(this.selectedProfile.id)
      profile.partners.forEach(partner => {
        if (this.selectedProfile.id === partner.id) return
        if (!this.find(currentPartners, partner) && !this.find(suggestedPartners, partner)) {
          suggestedPartners.push(partner)
        }
      })

      return suggestedPartners
    },

    age (aliveInterval) {
      return calculateAge(aliveInterval)
    },
    submit () {
      var recps = this.currentAccess
        ? [this.currentAccess.groupId]
        : null

      var submission = {
        ...pick(this.submission, [...PERMITTED_PERSON_ATTRS, ...PERMITTED_RELATIONSHIP_ATTRS]),
        recps
      }

      if (this.hasProfiles('newChildren')) {
        if (this.existingProfile && this.existingProfile.children) {
          // if quick adding children, remove exisiting children from the list
          let _children = this.quickAdd.newChildren.filter(child => {
            return this.existingProfile.children.every(d => child.id !== d.id)
          })
          if (_children.length) submission.children = _children
        } else {
          submission.children = this.quickAdd.newChildren
        }
      }

      if (this.hasProfiles('newParents')) {
        if (this.existingProfile && this.existingProfile.parents) {
          let _parents = this.quickAdd.newParents.filter(child => {
            return this.existingProfile.children.every(d => child.id !== d.id)
          })
          if (_parents.length) submission.parents = _parents
        } else {
          submission.parents = this.quickAdd.newParents
        }
      }

      if (this.hasProfiles('newPartners')) {
        if (this.existingProfile && this.existingProfile.partners) {
          let _partners = this.quickAdd.newPartners.filter(child => {
            return this.existingProfile.children.every(d => child.id !== d.id)
          })
          if (_partners.length) submission.partners = _partners
        } else {
          submission.partners = this.quickAdd.newPartners
        }
      }

      if (this.isDuplicate) {
        submission.moveDup = this.moveDup
      }

      this.$emit('create', submission)
      this.close()
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.resetFormData()
      this.$emit('close')
    },
    checkIfDuplicate (profile) {
      if (this.type === 'parent') {
        const existingParents = this.selectedProfile.parents
        const isNewParentExistingParentsPartner = existingParents.some(parent => {
          return parent.partners.some(p => p.id === profile.id)
        })
        if (isNewParentExistingParentsPartner) return false
      }

      if (this.type === 'child') {
        const existingPartners = this.selectedProfile.partners
        const isNewChildExistingPartnersChild = existingPartners.some(partner => {
          return partner.children.some(c => c.id === profile.id)
        })
        if (isNewChildExistingPartnersChild) return false
      }

      if (this.type === 'partner') {
        const existingChildren = this.selectedProfile.children
        const isNewPartnerExistingChildsParent = existingChildren.some(child => {
          return child.parents.some(p => p.id === profile.id)
        })
        if (isNewPartnerExistingChildsParent) return false
      }

      if (this.findInTree(profile.id)) return true

      return false
    },
    setFormData (person) {
      this.hasSelection = true
      this.profile = person
      this.isDuplicate = this.checkIfDuplicate(this.profile)
    },
    resetFormData () {
      if (this.hasSelection) {
        this.hasSelection = false
        this.formData = setDefaultData(this.withRelationships)
      }
      this.isDuplicate = false
      this.$emit('getSuggestions', null)
    },
    t (key, vars) {
      return this.$t('newNode.' + key, vars)
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return

        this.formData = setPersonProfile(newVal)
        if (!this.formData.relationshipType) this.formData.relationshipType = 'birth' // choose birth by default
      }
    },
    'formData.relationshipType' (newValue, oldValue) {
      // make sure adoption status can't be set true when relationship type is birth
      if (newValue === 'birth') this.formData.legallyAdopted = false
    },
    // watch for changes to avatarImage to decide when to show avatar
    'formData.avatarImage' (newValue) {
      if (!isEmpty(newValue)) {
        this.showAvatar = true
      }
    },
    'formData.preferredName' (newValue) {
      if (!newValue) return
      if (newValue.length > 2) {
        if (!this.hasSelection) {
          this.$emit('getSuggestions', newValue)
        }
      } else {
        this.$emit('getSuggestions', null)
      }
    },
    async hasSelection (newValue) {
      if (newValue) {
        this.$emit('getSuggestions', null)

        this.existingProfile = await this.getProfile(this.profile.id)

        // if hasSelection and quickAdd Section, show exsisting links
        if (this.generateChildren && this.existingProfile.children) this.updateQuickAdd(this.existingProfile.children, 'newChildren')
        if (this.generatePartners && this.existingProfile.partners) {
          this.quickAdd.partners = [...this.existingProfile.partners]
          this.quickAdd.newPartners = [...this.existingProfile.partners]
        }
        if (this.generateParents && this.existingProfile.parents) this.updateQuickAdd(this.existingProfile.parents, 'newParents')

        // hack: when there is no preferred name and a selected profile, the clearable button doesnt how up
        // doing this forces it to show
        if (this.formData.preferredName === '' || this.formData.preferredName === null) this.formData.preferredName = getDisplayName(this.formData)
      } else {
        this.quickAdd.newChildren = []
        this.quickAdd.newPartners = []
      }
    }
  }
}
</script>

<style>
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
.close {
  top: -25px;
  right: -10px;
}
.big-avatar {
  position: relative;
  top: -20px;
}
.v-input--checkbox label {
  font-size: 14px;
}

.v-input--radio-group__input label {
  font-size: 14px;
}
</style>
