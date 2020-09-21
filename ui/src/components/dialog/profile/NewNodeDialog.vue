<template>
  <Dialog :show="show" :title="title" width="720px" :goBack="close" enableMenu
    @submit="submit"
    @close="close"
  >

    <!-- Content Slot -->
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="py-0 px-0">

        <ProfileForm :profile.sync="formData" :readonly="hasSelection" :editRelationship="hasSelection" :withRelationships="withRelationships" :mobile="mobile">

          <!-- Slot = Search -->
          <template v-slot:search>
            <v-combobox
              v-model="formData.preferredName"
              :items="generateSuggestions"
              item-value="id"
              item-text="id"
              label="First name / Preferred name"
              :menu-props="{ light: true }"
              :clearable="hasSelection"
              append-icon=""
              v-bind="customProps"
              @click:clear="resetFormData()"
              :search-input.sync="formData.preferredName"
              :readonly="hasSelection"
              outlined
              @blur.native="clearSuggestions"
            >

              <!-- Slot:item = Data -->
              <template v-slot:item="data">
                <template v-if="typeof data.item === 'object'">
                  <v-list-item @click="setFormData(data.item)">
                    <Avatar class="mr-3" size="40px" :image="data.item.profile.avatarImage" :alt="data.item.profile.preferredName" :gender="data.item.profile.gender" :aliveInterval="data.item.profile.aliveInterval" />
                    <v-list-item-content>
                      <v-list-item-title> {{ data.item.profile.preferredName }} </v-list-item-title>
                      <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content>
                      <v-list-item-title> {{ data.item.profile.legalName ? data.item.profile.legalName :  '&nbsp;' }} </v-list-item-title>
                      <v-list-item-subtitle>Legal name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-list-item-title> {{ age(data.item.profile.aliveInterval) }} </v-list-item-title>
                      <v-list-item-subtitle>Age</v-list-item-subtitle>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </template>
            </v-combobox>
          </template>
        </ProfileForm>

      </v-col>
    </template>
    <template v-slot:before-actions>
      <AccessButton v-if="currentAccess" :access="currentAccess" disabled/>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

import ProfileForm from '@/components/profile/ProfileForm.vue'

import Avatar from '@/components/Avatar.vue'
import isEmpty from 'lodash.isempty'
import calculateAge from '@/lib/calculate-age'

import uniqby from 'lodash.uniqby'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

import { PERMITTED_PERSON_ATTRS, PERMITTED_RELATIONSHIP_ATTRS, getPerson } from '@/lib/person-helpers'
import AccessButton from '@/components/button/AccessButton.vue'
import { mapGetters } from 'vuex'

function defaultData (input) {
  var profile = clone(input)

  return {
    type: 'person',
    id: profile.id,
    gender: profile.gender,
    legalName: profile.legalName,
    aliveInterval: profile.aliveInterval,
    preferredName: profile.preferredName,
    avatarImage: profile.avatarImage,
    description: profile.description,
    birthOrder: profile.birthOrder,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    deceased: profile.deceased,
    address: profile.address,
    profession: profile.profession,
    altNames: {
      currentState: clone(profile.altNames),
      add: [], // new altNames to add
      remove: [] // altNames to remove
    }
  }
}

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
    location: '',
    profession: '',
    address: '',
    email: '',
    phone: '',
    deceased: false
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
    AccessButton
  },
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
        'child', 'parent', 'sibling'
      ].includes(val)
    }
  },
  data () {
    return {
      formData: setDefaultData(this.withRelationships),
      hasSelection: false,
      closeSuggestions: [],
      profile: {}
    }
  },
  mounted () {
    this.getCloseSuggestions()
  },
  computed: {
    ...mapGetters(['currentAccess']),
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
          this.type ? (this.type === 'child' ? { header: 'Suggested children' } : { header: 'Suggested parents' }) : null,
          ...this.closeSuggestions,
          this.type ? { divider: true } : null
        ]
      }

      return [
        ...closeSuggestions,
        ...otherSuggestions
      ].filter(Boolean)
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    customProps () {
      // readonly = hasSelected || !isEditing
      return {
        readonly: this.readonly,
        flat: this.readonly,
        hideDetails: true,
        placeholder: ' ',
        class: this.readonly ? 'custom' : ''
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
    getCloseSuggestions () {
      switch (this.type) {
        case 'child':
          return this.findChildren()
        case 'parent':
          return this.findParents()
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
          const result = await this.$apollo.query(getPerson(partner.id))
          if (result.data) {
            result.data.person.children.forEach(d => {
              if (!currentChildren[d.profile.id]) {
                children.push(d)
              }
            })
          }
        })
      }

      // get ignored children
      const ignored = await this.$apollo.query(getPerson(this.selectedProfile.id))
      if (ignored.data) {
        ignored.data.person.children.forEach(d => {
          if (!currentChildren[d.profile.id]) {
            children.push(d)
          }
        })
      }
      children = uniqby(children, 'linkId')

      // eslint-disable-next-line no-return-assign
      return this.closeSuggestions = children
    },

    async findParents () {
      var currentParents = []
      var parents = []

      if (this.selectedProfile.parents) {
        this.selectedProfile.parents.forEach(d => {
          currentParents[d.id] = d
        })
      }

      if (this.selectedProfile.siblings) {
        this.selectedProfile.siblings.forEach(async sibling => {
          const result = await this.$apollo.query(getPerson(sibling.id))

          if (result.data) {
            result.data.person.parents.forEach(d => {
              if (!currentParents[d.profile.id]) {
                parents.push(d)
              }
            })
          }
        })
      }

      // get ignored parents
      const ignored = await this.$apollo.query(getPerson(this.selectedProfile.id))
      if (ignored.data) {
        ignored.data.person.parents.forEach(d => {
          if (!currentParents[d.profile.id]) {
            parents.push(d)
          }
        })
      }

      parents = uniqby(parents, 'realtionshipId')

      // eslint-disable-next-line no-return-assign
      return this.closeSuggestions = parents
    },
    age (aliveInterval) {
      return calculateAge(aliveInterval)
    },
    submit () {
      var recps = this.currentAccess
        ? [this.currentAccess.groupId]
        : null

      console.log(this.submission)

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
    async setFormData (person) {
      this.hasSelection = true
      this.profile = person.profile
      this.formData.relationshipType = person.relationshipType
      this.formData.legallyAdopted = false
    },
    resetFormData () {
      if (this.hasSelection) {
        this.hasSelection = false
        this.formData = setDefaultData(this.withRelationships)
      }
    }

  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) return
        this.formData = defaultData(newVal)
      }
    },
    'formData.relationshipType' (newValue, oldValue) {
      // make sure adoption status can't be set true when relationship type is birth
      if (newValue === 'birth') this.formData.legallyAdopted = false
    },
    // watch for changes to avatarImage to decide when to show avatar
    'formData.avatarImage' (newValue) {
      if (!isEmpty(this.formData.avatarImage)) {
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
      }
    }
  }
}
</script>

<style scoped>
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
