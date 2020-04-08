<template>
  <Dialog :show="show" :title="title" @close="close" width="720px" :goBack="close" enableMenu>

    <!-- Content Slot -->
    <template v-if="!hideDetails" v-slot:content>
      <v-col class="py-0">

        <ProfileForm :profile.sync="formData" :readonly="hasSelection" :editRelationship="hasSelection">

          <!-- Slot = Search -->
          <template v-slot:search>
            <v-combobox
              v-model="formData.preferredName"
              :items="generateSuggestions"
              item-value="id"
              item-text="id"
              label="Preferred name"
              :menu-props="{ light: true }"
              :clearable="hasSelection"
              append-icon=""
              v-bind="customProps"
              @click:clear="resetFormData()"
              :search-input.sync="formData.preferredName"
              placeholder="Enter or search a preferred name"
              :readonly="hasSelection"
              outlined
            >

              <!-- Slot:item = Data -->
              <template v-slot:item="data">
                <template v-if="typeof data.item === 'object'">
                  <v-list-item @click="setFormData(data.item)">
                    <Avatar class="mr-3" size="40px" :image="data.item.avatarImage" :alt="data.item.preferredName" :gender="data.item.gender" :bornAt="data.item.bornAt" />
                    <v-list-item-content>
                      <v-list-item-title> {{ data.item.preferredName }} </v-list-item-title>
                      <v-list-item-subtitle>Preferred name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-content>
                      <v-list-item-title> {{ data.item.legalName ? data.item.legalName :  '&nbsp;' }} </v-list-item-title>
                      <v-list-item-subtitle>Legal name</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-list-item-title> {{ age(data.item.bornAt) }} </v-list-item-title>
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
    <!-- End Content Slot -->

    <!-- Actions Slot -->
    <template v-slot:actions  style="border: 2px solid orange;">
      <v-btn @click="close"
        text large fab
        class="secondary--text"
      >
        <v-icon color="secondary">mdi-close</v-icon>
      </v-btn>
      <v-btn @click="submit"
        text large fab
        class="blue--text ml-5"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
    <!-- End Actions Slot -->

  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

import ProfileForm from '@/components/profile-form/ProfileForm.vue'

import Avatar from '@/components/Avatar.vue'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import calculateAge from '@/lib/calculate-age'

import { getProfile } from '@/lib/profile-helpers'

function setDefaultData (withRelationships) {
  const formData = {
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
    bornAt: '',
    diedAt: '',
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
    ProfileForm
  },
  props: {
    show: { type: Boolean, required: true },
    withRelationships: { type: Boolean, default: true },
    title: { type: String, default: 'Create a new person' },
    suggestions: { type: Array },
    hideDetails: { type: Boolean, default: false },
    selectedProfile: { type: Object },
    type: {
      type: String,
      validator: (val) => [
        'child', 'parent'
      ].includes(val)
    }
  },
  data () {
    return {
      formData: setDefaultData(this.withRelationships),
      hasSelection: false,
      closeSuggestions: []
    }
  },
  mounted () {
    this.closeSuggestions = this.getCloseSuggestions()
  },
  computed: {
    generateSuggestions () {
      if (this.hasSelection) return []

      let otherSuggestions = []
      let closeSuggestions = []

      if (this.suggestions && this.suggestions.length > 0) {
        otherSuggestions = [
          this.type ? { header: 'Suggestions not in this whakapapa' } : null,
          ...this.suggestions.filter(suggestion => {
            return !this.closeSuggestions.find(closeSuggestion => {
              return suggestion.id === closeSuggestion
            })
          })
        ]
      }

      if (this.closeSuggestions && this.closeSuggestions.length > 0) {
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
          if (key === 'birthOrder') {
            submission[key] = parseInt(value)
          } else {
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
    findChildren () {
      var currentChildren = []
      var children = []

      this.selectedProfile.children.forEach(d => {
        currentChildren[d.id] = d
      })

      // children of your partners that arent currently your children
      this.selectedProfile.partners.forEach(async child => {
        const result = await this.$apollo.query(getProfile(child.id))

        if (result.data) {
          result.data.person.children.forEach(d => {
            if (!currentChildren[d.profile.id]) {
              children.push(d.profile)
            }
          })
        }
      })

      return children
    },
    findParents () {
      var currentParents = []
      var parents = []

      this.selectedProfile.parents.forEach(d => {
        currentParents[d.id] = d
      })

      this.selectedProfile.siblings.forEach(async sibling => {
        const result = await this.$apollo.query(getProfile(sibling.id))

        if (result.data) {
          result.data.person.parents.forEach(d => {
            if (!currentParents[d.profile.id]) {
              parents.push(d.profile)
            }
          })
        }
      })
      return parents
    },
    age (bornAt) {
      return calculateAge(bornAt)
    },
    submit () {
      var submission = Object.assign({}, this.submission)
      this.hasSelection
        ? this.$emit('create', pick(this.formData, ['id', 'relationshipType', 'legallyAdopted']))
        : this.$emit('create', submission)
      this.close()
    },
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    setFormData (profile) {
      this.hasSelection = true
      this.formData = profile
      this.formData.relationshipType = 'birth'
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
    'formData.deceased' (newValue) {
      if (newValue === false) {
        this.formData.diedAt = ''
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
