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
        >

          <!-- Slot = Search -->
          <template v-slot:search>
            <v-combobox
              v-model="formData.preferredName"
              :items="generateSuggestions"
              item-value="id"
              item-text="id"
              label="First name / known as"
              :menu-props="{ light: true }"
              :clearable="hasSelection"
              append-icon=""
              v-bind="customProps"
              @click:clear="resetFormData()"
              :search-input.sync="formData.preferredName"
              :readonly="hasSelection"
              :outlined="!hasSelection"
              @blur.native="clearSuggestions"
            >

              <!-- Slot:item = Data -->
              <template v-slot:item="data">
                <template v-if="typeof data.item === 'object'">
                  <v-list-item @click="setFormData(data.item)">
                    <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :aliveInterval="data.item.aliveInterval" />
                    <v-list-item-content v-if="data.item.preferredName">
                      <v-list-item-title> {{ data.item.preferredName }} </v-list-item-title>
                      <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content v-if="data.item.legalName">
                      <v-list-item-title> {{ data.item.legalName }} </v-list-item-title>
                      <v-list-item-subtitle>Full Name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content v-if="!data.item.preferredName && !data.item.legalName">
                      <v-list-item-title> Unknown </v-list-item-title>
                      <v-list-item-subtitle>Full Name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action v-if="age(data.item.aliveInterval)">
                      <v-list-item-title> {{ age(data.item.aliveInterval) }} </v-list-item-title>
                      <v-list-item-subtitle>Age</v-list-item-subtitle>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </template>
            </v-combobox>
          </template>

          <template v-slot:addParents>
            <v-col cols="12" :class="mobile ? 'px-0':'py-0'" v-if="hasProfiles('parents')">
              <ProfileList
                label="Add other parent"
                :addedProfiles.sync="quickAdd['newParents']"
                :items="generateParents"
                @profile-click="addProfile($event, 'newParents')"
                @related-by="updateRelationships($event, 'newParents')"
              />
            </v-col>
          </template>
          <template v-slot:addChildren>
            <v-col cols="12" v-if="hasProfiles('children')">
              <ProfileList
                label="Add children"
                :addedProfiles.sync="quickAdd['newChildren']"
                :items="generateChildren"
                @profile-click="addProfile($event, 'newChildren')"
                @related-by="updateRelationships($event, 'newChildren')"
              />
            </v-col>
          </template>
          <template v-slot:addPartners>
            <v-col cols="12" v-if="hasProfiles('partners')">
              <ProfileList
                label="Add partners"
                :addedProfiles.sync="quickAdd['newPartners']"
                :items="generatePartners"
                @profile-click="addProfile($event, 'newPartners')"
              />
            </v-col>
          </template>
        </ProfileForm>

      </v-col>
    </template>
    <template v-slot:before-actions>
      <AccessButton v-if="currentAccess" :access="currentAccess" type="person" disabled/>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

import ProfileForm from '@/components/profile/ProfileForm.vue'
import ProfileList from '@/components/profile/ProfileList.vue'

import Avatar from '@/components/Avatar.vue'
import isEmpty from 'lodash.isempty'
import calculateAge from '@/lib/calculate-age'

import pick from 'lodash.pick'

import { PERMITTED_PERSON_ATTRS, PERMITTED_RELATIONSHIP_ATTRS, getDisplayName, setPersonProfile } from '@/lib/person-helpers'
import AccessButton from '@/components/button/AccessButton.vue'
import { mapGetters } from 'vuex'
import { parseInterval } from '@/lib/date-helpers.js'

import mapProfileMixins from '@/mixins/profile-mixins.js'

function setDefaultData (withRelationships) {
  const formData = {
    type: 'person',
    id: '',
    preferredName: '',
    legalName: '',
    altNames: {
      add: []
    },
    gender: '',
    relationshipType: 'birth',
    legallyAdopted: false,
    children: [],
    avatarImage: {},
    aliveInterval: '',
    birthOrder: '',
    description: '',
    city: '',
    country: '',
    postCode: '',
    profession: '',
    address: '',
    email: '',
    phone: '',
    deceased: false,
    placeOfBirth: '',
    placeOfDeath: '',
    buriedLocation: '',
    education: [],
    school: []
  }

  if (!withRelationships) {
    delete formData.relationshipType
    delete formData.legallyAdopted
  }

  return formData
}

export default {
  name: 'NewNodeDialog',
  components: {
    Avatar,
    Dialog,
    ProfileForm,
    AccessButton,
    ProfileList
  },
  mixins: [
    mapProfileMixins({
      mapMethods: ['getProfile']
    })
  ],
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
    }
  },
  data () {
    return {
      formData: setDefaultData(this.allowRelationships),
      hasSelection: false,
      closeSuggestions: [],
      profile: {},
      quickAdd: {
        newParents: [],
        newChildren: [],
        newPartners: [],
        parents: [],
        children: [],
        partners: []
      },
      existingProfile: null
    }
  },
  async mounted () {
    this.closeSuggestions = await this.getCloseSuggestions()

    this.quickAdd['parents'] = await this.newChildParents(this.selectedProfile)
    if (this.type === 'partner') this.quickAdd['children'] = this.newPartnerChildren(this.selectedProfile)
    else if (this.type === 'parent') this.quickAdd['children'] = this.newParentChildren(this.selectedProfile)
    this.quickAdd['partners'] = this.selectedProfile.parents
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
    updateRelationships (profile, selectedArray) {
      var arr = this.quickAdd[selectedArray]
      var foundIndex = arr.findIndex(x => x.id === profile.id)
      this.quickAdd[selectedArray][foundIndex] = profile
    },
    addProfile (profile, selectedArray) {
      if (this.quickAdd[selectedArray].some(d => d.id === profile.id)) {
        this.quickAdd[selectedArray] = this.quickAdd[selectedArray].filter(d => d.id !== profile.id)
      } else this.quickAdd[selectedArray].push(profile)
    },
    hasProfiles (field) {
      return this.quickAdd[field] && this.quickAdd[field].length > 0
    },
    getSuggestionsByField (field) {
      if (!this.hasProfiles(field)) return []
      return this.quickAdd[field].filter(Boolean)
    },
    clearSuggestions () {
      this.$emit('getSuggestions', null)
    },
    getCloseSuggestions () {
      switch (this.type) {
        case 'child':
          return this.findChildren()
        case 'parent':
          return this.findParents()
        case 'partner':
          return this.findPartners()
        default:
          return []
      }
    },
    async findChildren () {
      var currentChildren = this.selectedProfile.children || []
      var suggestedChildren = []

      // children of your partners that arent currently your children
      if (this.selectedProfile.partners) {
        await Promise.all(
          this.selectedProfile.partners.map(async partner => {
            const profile = await this.getProfile(partner.id)

            profile.children.forEach(child => {
              if (!this.find(currentChildren, child) && !this.find(suggestedChildren, child)) {
                suggestedChildren.push(child)
              }
            })

            return partner
          })
        )
      }

      // get ignored children
      const profile = await this.getProfile(this.selectedProfile.id)
      profile.children.forEach(child => {
        if (!this.find(currentChildren, child) && !this.find(suggestedChildren, child)) {
          suggestedChildren.push(child)
        }
      })

      return suggestedChildren
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

    async findParents () {
      var currentParents = this.selectedProfile.parents
      if (!currentParents) return []

      var suggestedParents = []

      currentParents.forEach(parent => {
        if (!parent.partners) return

        parent.partners.forEach(partner => {
          if (!this.find(currentParents, partner) && !this.find(suggestedParents, partner)) {
            suggestedParents.push(partner)
          }
        })
      })

      await Promise.all(
        this.selectedProfile.siblings.map(async sibling => {
          // needed because siblings dont have information about their parents yet
          const profile = await this.getProfile(sibling.id)

          if (!profile.parents) return sibling

          profile.parents.forEach(parent => {
            if (!this.find(currentParents, parent) && !this.find(suggestedParents, parent)) {
              suggestedParents.push(parent)
            }
          })
          return sibling
        })
      )

      // get ignored parents
      const profile = await this.getProfile(this.selectedProfile.id)
      profile.parents.forEach(parent => {
        if (!this.find(currentParents, parent) && !this.find(suggestedParents, parent)) {
          suggestedParents.push(parent)
        }
      })

      return suggestedParents
    },

    find (array, item) {
      return array.some(i => i.id === item.id)
    },

    async findPartners () {
      var currentPartners = this.selectedProfile.partners || []
      if (!currentPartners || currentPartners.length === 0) return []

      var suggestedPartners = []

      currentPartners.forEach(parent => {
        if (!parent.partners) return

        parent.partners.forEach(partner => {
          if (!this.find(currentPartners, partner) && !this.find(suggestedPartners, partner)) {
            suggestedPartners.push(partner)
          }
        })
      })

      await Promise.all(
        this.selectedProfile.children.map(async child => {
          // needed because siblings dont have information about their parents yet
          const profile = await this.getProfile(child.id)

          if (!profile.parents) return child

          profile.parents.forEach(parent => {
            if (!this.find(currentPartners, parent) && !this.find(suggestedPartners, parent)) {
              suggestedPartners.push(parent)
            }
          })
          return child
        })
      )

      // get ignored parents
      const profile = await this.getProfile(this.selectedProfile.id)
      profile.partners.forEach(partner => {
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
          let _children = this.quickAdd['newChildren'].filter(child => {
            return this.existingProfile.children.every(d => child.id !== d.id)
          })
          if (_children.length) submission.children = _children
        } else {
          submission.children = this.quickAdd['newChildren']
        }
      }

      if (this.hasProfiles('newParents')) {
        if (this.existingProfile && this.existingProfile.parents) {
          let _parents = this.quickAdd['newParents'].filter(child => {
            return this.existingProfile.children.every(d => child.id !== d.id)
          })
          if (_parents.length) submission.children = _parents
        } else {
          submission.parents = this.quickAdd['newParents']
        }
      }

      if (this.hasProfiles('newPartners')) {
        if (this.existingProfile && this.existingProfile.partners) {
          let _partners = this.quickAdd['newPartners'].filter(child => {
            return this.existingProfile.children.every(d => child.id !== d.id)
          })
          if (_partners.length) submission.children = _partners
        } else {
          submission.partners = this.quickAdd['newPartners']
        }
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
    setFormData (person) {
      this.hasSelection = true

      this.profile = person
    },
    resetFormData () {
      if (this.hasSelection) {
        this.hasSelection = false
        this.formData = setDefaultData(this.withRelationships)
      }
      this.$emit('getSuggestions', null)
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
        if (this.generateChildren && this.existingProfile.children) this.quickAdd['newChildren'] = [...this.existingProfile.children]
        if (this.generatePartners && this.existingProfile.partners) {
          this.quickAdd['partners'] = [...this.existingProfile.partners]
          this.quickAdd['newPartners'] = [...this.existingProfile.partners]
        }
        if (this.generateParents && this.existingProfile.parents) this.quickAdd['newParents'] = [...this.existingProfile.parents]

        // hack: when there is no preferred name and a selected profile, the clearable button doesnt how up
        // doing this forces it to show
        if (this.formData.preferredName === '' || this.formData.preferredName === null) this.formData.preferredName = getDisplayName(this.formData)
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
