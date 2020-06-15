<template>
  <div class="side-menu" style="border-left: 0.5px solid rgba(0,0,0,0.1);">

    <!--===== MOBILE VERSION of side menu is a Dialog =====-->
    <Dialog v-if="mobile" :title="formData.preferredName" :show="show" @close="close" width="720px" :goBack="close" :enableBar="false" :isEditing="isEditing">
      <!-- Mobile: Slot Title -->
      <template v-slot:title >
        <v-row class="justify-center" style="margin-top: -20px;">
          <v-btn
            @click="toggleEdit"
            color="white"
            text
            medium
            class="blue--text"
          >
            <v-icon small class="blue--text" left>mdi-pencil</v-icon>Edit
          </v-btn>
        </v-row>
      </template>

      <!-- Mobile: Slot Content -->
      <template v-slot:content>
        <ProfileForm :profile.sync="formData" :readonly="!isEditing" mobile>
        </ProfileForm>
      </template>
      <!-- End of mobile content -->
    </Dialog>

    <!--===== DESKTOP VERSION of side menu =====-->
    <v-row>
      <v-col>
        <ProfileForm :profile.sync="formData" :readonly="!isEditing" mobile>
        </ProfileForm>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import {
  GENDERS,
  RULES,
  RELATIONSHIPS
} from '@/lib/constants'

import calculateAge from '../../../lib/calculate-age'

import { PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/profile-helpers'

import Dialog from '@/components/dialog/Dialog.vue'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

import ProfileForm from '@/components/profile-form/ProfileForm.vue'

function defaultData (profile) {
  return {
    id: profile.id,
    gender: profile.gender,
    legalName: profile.legalName,
    aliveInterval: profile.aliveInterval,
    bornAt: '',
    diedAt: '',
    preferredName: profile.preferredName,
    avatarImage: profile.avatarImage,
    description: profile.description,
    birthOrder: profile.birthOrder,
    relationshipType: profile.relationship ? profile.relationship.relationshipType : null,
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

export default {
  name: 'SideViewEditNodeDialog',
  components: {
    ProfileForm,
    Dialog
  },
  props: {
    goBack: { type: Function },
    profile: { type: Object, required: true },
    deleteable: { type: Boolean, default: false },
    warnAboutChildren: { type: Boolean, default: true },
    view: { type: Object },
    sideMenu: { type: Boolean, default: false },
    relationshipLinks: { type: Array },
    show: { type: Boolean, required: true },
    readonly: { type: Boolean, default: false }
  },

  data () {
    return {
      testmapimage: require('../../../assets/map-test.png'),
      genders: GENDERS,
      permitted: PERMITTED_PROFILE_ATTRS,
      relationshipTypes: RELATIONSHIPS,
      isEditing: false,
      formData: defaultData(this.profile),
      showDescription: false,
      deleteDialog: false,
      form: {
        valid: true,
        rules: RULES
      },
      genderSelected: ''
    }
  },
  computed: {
    orderNumbers () {
      var orderNumbers = [...Array(31).keys()]
      orderNumbers.splice(0, 1)
      return orderNumbers
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    profileChanges () {
      let changes = {}
      Object.entries(this.formData).forEach(([key, value]) => {
        if (!isEqual(this.formData[key], this.profile[key])) {
          switch (key) {
            case 'altNames':
              if (!isEqual(this.formData.altNames.add, this.profile.altNames)) {
                changes[key] = pick(this.formData.altNames, ['add', 'remove'])
                changes[key].add = changes[key].add.filter(Boolean)
              }
              break
            case 'birthOrder':
              changes[key] = parseInt(value)
              break
            case 'relationshipType':
              if (value && value !== this.profile.relationshipType) {
                changes[key] = value
              }
              break
            default:
              changes[key] = value
          }
        }
      })
      return changes
    },
    hasChanges () {
      return isEqual(this.data, this.profile)
    },
    customProps () {
      return {
        readonly: !this.isEditing,
        flat: !this.isEditing,
        // appendIcon: this.isEditing ? '' ? 'mdi-delete' : 'mdi-pencil',
        hideDetails: true,
        placeholder: ' ',
        class: !this.isEditing ? 'custom' : ''
      }
    }
  },
  watch: {
    profile (newVal) {
      this.formData = defaultData(newVal)
    },
    'formData.deceased' (newValue) {
      if (!newValue) this.formData.diedAt = ''
    }
  },
  methods: {
    updateSelectedGender (genderClicked) {
      // reset images to outlined
      this.$refs.taneImg.src = require('@/assets/tane-outlined.svg')
      this.$refs.wahineImg.src = require('@/assets/wahine-outlined.svg')
      // hightlight selected image
      this.genderSelected = genderClicked
      if (this.genderSelected === 'male') {
        this.$refs.taneImg.src = require('@/assets/tane.svg')
      }
      if (this.genderSelected === 'female') {
        this.$refs.wahineImg.src = require('@/assets/wahine.svg')
      }
      // update the gender
      this.formData.gender = this.genderSelected
    },
    removeAltNameField (index) {
      this.formData.altNames.add.splice(index, 1)
    },
    addAltNameField () {
      this.formData.altNames.add.push(null)
    },
    updateAvatar (avatarImage) {
      this.formData.avatarImage = avatarImage
      // this.toggleAvatar(null)
    },
    age (born) {
      var age = calculateAge(born)
      return age
    },
    close () {
      this.$emit('close')
    },
    cancel () {
      // reset form values
      this.formData = defaultData(this.profile)
      this.toggleEdit()
    },
    submit () {
      if (!this.$refs.form.validate()) {
        return
      }

      var output = Object.assign({}, pick(this.profileChanges, [...PERMITTED_PROFILE_ATTRS, ...PERMITTED_RELATIONSHIP_ATTRS]))

      if (!isEmpty(output)) {
        this.$emit('submit', output)
      }

      this.formData = defaultData(this.profile)
      this.toggleEdit()
    },
    openProfile (profile) {
      this.$emit('open-profile', profile.id)
    },
    toggleNew (type) {
      this.$emit('new', type)
    },
    toggleEdit () {
      this.isEditing = !this.isEditing
    },
    toggleAltName () {
      if (!this.formData.altNames.currentState) { this.formData.altNames.currentState = [] }
      this.formData.altNames.add.push(null)
    },
    toggleDescription () {
      this.showDescription = !this.showDescription
    },
    deleteFromState (altName, index) {
      this.deleteFromDialog(index) // removes it from the dialog
      this.formData.altNames.remove.push(altName)
    },
    deleteFromDialog (index) {
      this.formData.altNames.currentState.splice(index, 1)
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Forum&display=swap');

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

  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

.profile-label {
  color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
}

.profile-info {
  /* font-family: 'Forum', cursive; */
  text-align: center;
}

.side-menu {
  background-color: white;
  height:100%;
  overflow-x: hidden;
}

.scroll {
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 100%;
}

.family-divider {
  width: 80%;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
}

.text-field {
  margin-left: 5px !important;
  margin-bottom: 0 !important;
  font-size: 0.8em;
}

.gender-button {
    width: auto;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;

    .gender-image {
      width: 6em;
      height: 6em;
      border: 0.5px solid rgba(0,0,0,0.6);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border: 2px solid rgba(0,0,0,0.87);
      }
    }
}

</style>
