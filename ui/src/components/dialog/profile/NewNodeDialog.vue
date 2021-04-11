<template>
  <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >

    <!-- Content Slot -->
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="py-0 px-0">

        <ProfileForm :profile.sync="formData" :readonly="hasSelection" :editRelationship="hasSelection" :withRelationships="allowRelationships" :mobile="mobile" isNewNodeDialog :dialogType="type">

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
            <v-col cols="12" class="pa-5">
              <v-tooltip top open-delay="700" :disabled="addParents">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-row v-if="!addParents" @click="addParents = true" class="pl-5">
                      <v-icon small>mdi-plus</v-icon>
                      <AddButton size="20px" icon="mdi-account" iconClass="pr-3" label="Add Parent" justify="start"/>
                    </v-row>
                  </div>
                </template>
                <span>Add a parent to this new child</span>
              </v-tooltip>
              <ProfileSearchBar
                :selectedItems.sync="selectedParents"
                :items="generateParents"
                :openMenu.sync="addParents"
                placeholder="add mention"
                item="preferredName"
                @getSuggestions="$emit('getSuggestions', $event)"
              />
              <ProfileList v-if="selectedParents && selectedParents.length > 0"
                :items="selectedParents"
                @removeItem="removeItem(profileId, selectedParents)"
              />
            </v-col>
          </template>
          <template v-slot:addChildren>
            <v-col cols="12" class="pa-5">
              <v-tooltip top open-delay="700" :disabled="addChildren">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-row v-if="!addChildren" @click="addChildren = true" class="pl-5">
                      <v-icon small>mdi-plus</v-icon>
                      <AddButton size="20px" icon="mdi-account" iconClass="pr-3" label="Add Children" justify="start"/>
                    </v-row>
                  </div>
                </template>
                <span>Add children to this new partner</span>
              </v-tooltip>
              <ProfileSearchBar
                :selectedItems.sync="selectedChildren"
                :items="generateChildren"
                :openMenu.sync="addChildren"
                placeholder="add mention"
                item="preferredName"
                @getSuggestions="$emit('getSuggestions', $event)"
              />
              <ProfileList v-if="selectedChildren && selectedChildren.length > 0"
                :items="selectedChildren"
                @removeItem="removeItem(profileId, selectedChildren)"
              />
            </v-col>
          </template>
          <template v-slot:addPartners>
            <v-col cols="12" class="pa-5">
              <v-tooltip top open-delay="700" :disabled="addPartners">
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    <v-row v-if="!addPartners" @click="addPartners = true" class="pl-5">
                      <v-icon small>mdi-plus</v-icon>
                      <AddButton size="20px" icon="mdi-account" iconClass="pr-3" label="Add Partner" justify="start"/>
                    </v-row>
                  </div>
                </template>
                <span>Add partners to this new parent</span>
              </v-tooltip>
              <ProfileSearchBar
                :selectedItems.sync="selectedPartners"
                :items="generatePartners"
                :openMenu.sync="addPartners"
                placeholder="add mention"
                item="preferredName"
                @getSuggestions="$emit('getSuggestions', $event)"
              />
              <ProfileList v-if="selectedPartners && selectedPartners.length > 0"
                :items="selectedPartners"
                @removeItem="removeItem(profileId, selectedPartners)"
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
import ProfileSearchBar from '@/components/archive/ProfileSearchBar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'
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
    ProfileSearchBar,
    AvatarGroup,
    AddButton,
    ProfileList
  },
  mixins: [
    mapProfileMixins({
      mapMethods: ['getProfile']
    })
  ],
  props: {
    show: { type: Boolean, required: true },
    withRelationships: { type: Boolean, default: true },
    title: { type: String, default: 'Create a new person' },
    suggestions: Array,
    hideDetails: Boolean,
    selectedProfile: Object,
    withView: { type: Boolean, default: true },
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
      addParents: false,
      addChildren: false,
      addPartners: false,
      parents: [],
      selectedParents: [],
      children: [],
      selectedChildren: [],
      partners: [],
      selectedPartners: []
    }
  },
  async mounted () {
    this.closeSuggestions = await this.getCloseSuggestions()
    // this.parents = await this.newChildParents()
  },
  computed: {
    ...mapGetters(['currentAccess']),
    allowRelationships () {
      return this.withRelationships && this.type !== 'partner' && (this.profile.relationshipType === null || this.profile.relationshipType === undefined)
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
      let parentSuggestions = []

      this.parents = this.newChildParents()
      if (this.parents && this.parents.length > 0) {
        parentSuggestions = [this.header, ...this.parents, this.divider]
      }
      return parentSuggestions.filter(Boolean)
    },
    generateChildren () {
      let childrenSuggestions = []

      if (this.type === 'partner') this.children = this.newPartnerChildren()
      else if (this.type === 'parent') this.children = this.newParentChildren()
      if (this.children && this.children.length > 0) {
        childrenSuggestions = [this.header, ...this.children, this.divider]
      }
      return childrenSuggestions.filter(Boolean)
    },
    generatePartners () {
      let partnerSuggestions = []

      this.partners = this.newParentPartners()
      if (this.partners && this.partners.length > 0) {
        partnerSuggestions = [this.header, ...this.partners, this.divider]
      }
      return partnerSuggestions.filter(Boolean)
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
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
    clearSuggestions () {
      this.$emit('getSuggestions', null)
    },
    async getCloseSuggestions () {
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
      var currentChildren = []
      var children = []

      if (this.selectedProfile.children) {
        this.selectedProfile.children.forEach(d => {
          currentChildren[d.id] = d
        })
      }

      // children of your partners that arent currently your children
      if (this.selectedProfile.partners) {
        this.selectedProfile.partners.forEach(async partner => {
          const profile = await this.getProfile(partner.id)

          profile.children.forEach(d => {
            if (!currentChildren[d.id]) {
              children.push(d)
            }
          })
        })
      }

      // get ignored children
      const profile = await this.getProfile(this.selectedProfile.id)
      profile.children.forEach(d => {
        if (!currentChildren[d.id]) {
          children.push(d)
        }
      })

      return children
    },

    newChildParents () {
      var currentPartners = []

      if (this.selectedProfile.partners) {
        this.selectedProfile.partners.forEach(d => {
          currentPartners.push(d)
        })
      }
      return currentPartners
    },

    newPartnerChildren () {
      var currentChildren = []

      if (this.selectedProfile.children) {
        this.selectedProfile.children.forEach(d => {
          currentChildren.push(d)
        })
      }
      return currentChildren
    },

    newParentPartners () {
      var currentPartners = []

      if (this.selectedProfile.partners) {
        this.selectedProfile.partners.forEach(d => {
          currentPartners.push(d)
        })
      }
      return currentPartners
    },

    newParentChildren () {
      var currentChildren = []

      if (this.selectedProfile.siblings) {
        this.selectedProfile.siblings.forEach(d => {
          currentChildren.push(d)
        })
      }
      return currentChildren
    },

    async findParents () {
      var currentParents = []
      var parents = []
      if (this.selectedProfile.parents) {
        this.selectedProfile.parents.forEach(d => {
          currentParents[d.id] = d
        })

        // get suggestions from the parents partners
        this.selectedProfile.parents.forEach(parent => {
          if (!parent.partners) return

          parent.partners.forEach(partner => {
            if (!currentParents[partner.id] && !parents.includes(partner)) {
              parents.push(partner)
            }
          })
        })
      }

      if (this.selectedProfile.siblings) {
        this.selectedProfile.siblings.forEach(async sibling => {
          const profile = await this.getProfile(sibling.id)

          profile.parents.forEach(d => {
            if (!currentParents[d.id]) {
              parents.push(d)
            }
          })
        })
      }

      // get ignored parents
      const profile = await this.getProfile(this.selectedProfile.id)
      profile.parents.forEach(d => {
        if (!currentParents[d.id]) {
          parents.push(d)
        }
      })

      return parents
    },

    async findPartners () {
      var currentPartners = []
      var partners = []

      if (this.selectedProfile.partners) {
        this.selectedProfile.partners.forEach(d => {
          currentPartners[d.id] = d
        })
      }

      if (this.selectedProfile.children) {
        this.selectedProfile.children.forEach(async child => {
          const profile = await this.getProfile(child.id)

          profile.parents.forEach(d => {
            if (!currentPartners[d.id] && d.id !== this.selectedProfile.id) {
              partners.push(d)
            }
          })
        })
      }

      // get ignored partners
      const profile = await this.getProfile(this.selectedProfile.id)
      profile.partners.forEach(d => {
        if (!currentPartners[d.id]) {
          partners.push(d)
        }
      })

      return partners
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
    },
    removeItem (id, array) {
      console.log('remove id: ', id)
      var index = -1;
      for (var i = 0; i < array.length; i++) {
        if (array[i].id === id) index = i
      }
      array.splice(index, 1)
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
    hasSelection (newValue) {
      if (newValue) {
        this.$emit('getSuggestions', null)

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
