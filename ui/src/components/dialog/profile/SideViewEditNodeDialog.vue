<template>
  <v-navigation-drawer
    light
    width="450px"
    height="93.6%"
    :style="mobile ? '' : 'margin-top:64px;'"
    v-model="drawer"
    absolute
    permanent
    right
    class="scroll"
    :temporary="mobile ? true : false"
  >
    <v-card height="100%" class="scroll">
      <v-row class="justify-end pr-4">
        <v-btn icon>
          <v-icon @click="close" color="secondary">mdi-close</v-icon>
        </v-btn>
      </v-row>
      <v-row v-if="isEditing">
        <v-col>
          <ProfileForm :profile.sync="formData" :readonly="!isEditing" mobile @cancel="cancel" isEditing>
            <template v-slot:top>
              <v-row class="justify-center">
                <h1>Edit {{ formData.preferredName }}</h1>
              </v-row>
              <v-row class="justify-center">
                <v-btn
                  @click="toggleEdit"
                  color="white"
                  text
                  medium
                  class="blue--text"
                >
                  <v-icon small class="blue--text" left>mdi-close</v-icon>Cancel
                </v-btn>
              </v-row>
            </template>
          </ProfileForm>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="auto" class="mb-8">
          <v-btn
            v-if="isEditing && deleteable"
            @click="$emit('delete')"
            align="center"
            color="white"
            text
            class="secondary--text"
          >
            <v-icon class="secondary--text" left>mdi-delete</v-icon>Delete this person
          </v-btn>
        </v-col>
        <v-col
          v-if="isEditing"
          col="12"
          :align="mobile ? '' : 'right'"
          class="pt-0 d-flex justify-space-between"
        >
          <v-btn @click="cancel" text large fab class="secondary--text mr-10">
            <v-icon color="secondary">mdi-close</v-icon>
          </v-btn>
          <v-btn @click="submit" text large fab class="blue--text ml-5" color="blue">
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-if="!isEditing"  class="justify-center">
        <Avatar
          class="big-avatar"
          size="250px"
          :image="formData.avatarImage"
          :alt="profile.preferredName"
          :gender="formData.gender"
          :bornAt="formData.bornAt"
          :deceased="formData.deceased"
          :isEditing="isEditing"
          style="margin-top: 20px;"
          @updateAvatar="formData.avatarImage = $event"
        />
      </v-row>
      <v-row class="justify-center">
        <!-- <v-col> -->
          <h1 v-if="!isEditing">{{ formData.preferredName }}</h1>
        <!-- </v-col> -->
      </v-row>
      <v-row v-if="!isEditing"  class="justify-center">
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
      <v-row v-if="formData.description && !isEditing" class="mb-2">
        <v-col cols="12">
          <v-row>
            <v-col class="py-1 px-0 profile-label"><small>Description</small></v-col>
          </v-row>
          <v-row class="py-0 justify-center">
            <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.description}}</p>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="!isEditing"  style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px;" class="flex-column mx-2">
        <v-col>
          <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0">
            <v-col cols="6">
              <v-row>
                <v-col class="py-1 px-0 profile-label"><small>Legal Name</small></v-col>
              </v-row>
              <v-row class="py-0 justify-center">
                <p class="ma-0 profile-info">{{formData.legalName}}</p>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row>
                <v-col class="py-1 px-0 profile-label"><small>Age</small></v-col>
              </v-row>
              <v-row class="py-0 justify-center">
                <p class="ma-0 profile-info">{{age(formData.aliveInterval)}}</p>
              </v-row>
            </v-col>
          </v-row>
          <v-row class="ma-0">
            <v-col cols="6">
              <v-row>
                <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
              </v-row>
              <v-row class="py-0 justify-center">
                <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.profession}}</p>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row>
                <v-col class="py-1 px-0 profile-label"><small>Location</small></v-col>
              </v-row>
              <v-row class="py-0 justify-center">
                <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.location}}</p>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="!isEditing"  class="px-2">
        <v-col cols="12" class="border-right">
          <v-row class="d-flex flex-column justify-center align-center">
            <v-col :cols="12" class="pa-0">
              <AvatarGroup
                :profiles="profile.parents"
                group-title="Parents"
                size="50px"
                :show-labels="true"
                @profile-click="openProfile($event)"
              >
                <AddButton @click="toggleNew('parent')" />
              </AvatarGroup>
            </v-col>

            <hr v-if="profile.siblings" class="family-divider"/>

            <v-col :cols="12" v-if="profile.siblings" class="pa-0">
              <AvatarGroup
                :profiles="profile.siblings"
                group-title="Siblings"
                size="60px"
                :show-labels="true"
                @profile-click="openProfile($event)"
              >
                <AddButton v-if="view.focus !== profile.id" @click="toggleNew('sibling')" />
              </AvatarGroup>
            </v-col>

            <hr v-if="profile.siblings" class="family-divider"/>

            <v-col :cols="12" class="pa-0">
              <AvatarGroup
                v-if="profile.children.length"
                :profiles="profile.children"
                group-title="Children"
                size="60px"
                :show-labels="true"
                @profile-click="openProfile($event)"
              >
                <AddButton @click="toggleNew('child')" />
              </AvatarGroup>
              <AvatarGroup
                v-else
                :profiles="profile._children"
                group-title="Children"
                size="60px"
                :show-labels="true"
                @profile-click="openProfile($event)"
              >
                <AddButton @click="toggleNew('child')" />
              </AvatarGroup>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import {
  GENDERS,
  RULES,
  RELATIONSHIPS
} from '@/lib/constants'

import calculateAge from '../../../lib/calculate-age'

import { PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/profile-helpers'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

import edtf from 'edtf'

import ProfileForm from '@/components/profile-form/ProfileForm.vue'

import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AddButton from '@/components/button/AddButton.vue'

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
    AddButton,
    Avatar,
    AvatarGroup
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
      genderSelected: '',
      drawer: this.show
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    orderNumbers () {
      var orderNumbers = [...Array(31).keys()]
      orderNumbers.splice(0, 1)
      return orderNumbers
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
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        this.formData = defaultData(newVal)

        if (this.formData.aliveInterval) {
          var v = edtf(this.formData.aliveInterval)
          this.formData.bornAt = v.lower || ''
          this.formData.diedAt = v.upper || ''
        } else {
          this.formData.bornAt = ''
          this.formData.diedAt = ''
        }
      }
    },
    'formData.deceased' (newValue) {
      if (!newValue) this.formData.diedAt = ''
    },
    'formData.bornAt' (newVal) {
      if (this.formData.aliveInterval) {
        var dates = this.formData.aliveInterval.split('/')
        this.formData.aliveInterval = (newVal || '') + '/' + (dates[1] || '')
      } else {
        this.formData.aliveInterval = (newVal || '') + '/'
      }
    },
    'formData.diedAt' (newVal) {
      if (this.formData.aliveInterval) {
        var dates = this.formData.aliveInterval.split('/')
        this.formData.aliveInterval = (dates[0] || '') + '/' + (newVal || '')
      } else {
        this.formData.aliveInterval = '/' + (newVal || '')
      }
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

  .scroll {
    overflow-x: hidden;
    overflow-y: auto;
  }

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
