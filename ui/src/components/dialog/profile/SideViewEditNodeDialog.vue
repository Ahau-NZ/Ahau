<template>
  <div
  :node="profile"
  @close="close"
  width="720px"
  :fullscreen="mobile"
  style="background-color: white; height:100%;"
  >
    <Appbar v-if="mobile" enableMenu app :goBack="close" :sideMenu="sideMenu"  />
    <v-form ref="form" style="height:100%">
      <v-card light style="height:100%">
        <v-container class="pa-0" style="height:100%">
          <v-card-text style="height:100%; overflow:scroll">
            <v-row class="px-2">
              <v-col cols="12">
                <v-row class="pa-0">
                  <!-- Dialog close button -->
                  <v-col v-if="!mobile" cols="offset-7 4 " class="pa-0" align="right">
                    <v-btn @click="close" fab text top right color="secondary" class="close">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-col>
                  <v-col cols="12" class="pa-0" >
                    <!-- Avatar -->
                    <Avatar
                      class="big-avatar"
                      size="250px"
                      :image="formData.avatarImage"
                      :alt="profile.preferredName"
                      :gender="formData.gender"
                      :bornAt="formData.bornAt"
                      :diedAt="formData.diedAt"
                    />
                  </v-col>
                  <v-col v-if="isEditing" cols="12" justify="center" align="center" class="pa-0">
                    <ImagePicker @updateAvatar="formData.avatarImage = $event" />
                  </v-col>
                  <!-- END of Avatar -->
                </v-row>
              </v-col>
              <!-- Information Col -->
              <v-col cols="12" class="border-right">
                <v-row>
                  <!-- View Mode Title -->
                  <v-col v-if="!isEditing" cols="12" class="pa-0 pb-5">
                    <h1>{{ formData.preferredName }}'s Information</h1>

                    <v-btn
                      v-if="!isEditing"
                      @click="toggleEdit"
                      align="right"
                      color="white"
                      text
                      x-small
                      class="blue--text pt-3"
                    >
                      <v-icon small class="blue--text" left>mdi-pencil</v-icon>Edit
                    </v-btn>
                  </v-col>
                  <!-- Edit Mode Title -->
                  <v-col v-else cols="12" class="pa-0 pb-5">
                    <h1>Edit {{ formData.preferredName }}</h1>
                  </v-col>
                  <!-- Preferred Name -->
                  <v-col cols="12" class="pa-1">
                    <v-text-field
                      v-model="formData.preferredName"
                      label="Preferred name. This is the name shown on your profile"
                      v-bind="customProps"
                    />
                  </v-col>
                  <!-- Legal Name -->
                  <v-col cols="12" class="pa-1">
                    <v-text-field
                      v-model="formData.legalName"
                      label="Legal name."
                      v-bind="customProps"
                    />
                  </v-col>
                  <!-- Alt Names Already Present THESE ARE READONLY SO THEY CAN ONLY BE DELETED -->
                  <v-col
                    v-for="(altName, index) in formData.altNames.currentState"
                    :key="`a-${index}`"
                    cols="12"
                    sm="6"
                    class="pa-0"
                  >
                    <v-col
                      v-if="altName || isEditing"
                      :class="!altName && !isEditing ? 'pt-0 pb-0' : 'pa-1'"
                      cols="12"
                    >
                      <v-text-field
                        v-model="formData.altNames.currentState[index]"
                        :label="`Alternative name ${index + 1}`"
                        :append-icon="isEditing ? 'mdi-delete' : ''"
                        @click:append="deleteFromState(altName, index)"
                        readonly
                        v-bind="customProps"

                      />
                    </v-col>
                  </v-col>
                  <!-- New Alt names to be added -->
                  <v-col
                    v-for="(altName, index) in formData.altNames.add"
                    :key="`b-${index}`"
                    cols="12"
                    sm="6"
                    class="pa-0"
                  >
                    <v-col
                      v-if="altName || isEditing"
                      :class="!altName && !isEditing ? 'pt-0 pb-0' : 'pa-1'"
                      cols="12"
                    >
                      <v-text-field
                        v-model="formData.altNames.add[index]"
                        :label="`Alternative name ${index + 1}`"
                        :append-icon="isEditing ? 'mdi-delete' : ''"
                        @click:append="deleteFromDialog(index)"
                        v-bind="customProps"

                      />
                    </v-col>
                  </v-col>
                  <!-- Add Alt Name Button -->
                  <v-col v-if="isEditing" cols="12" class="pa-1">
                    <AddButton label="Add name" @click="toggleAltName" row />
                  </v-col>
                  <!-- Date of Birth -->
                  <v-col cols="12" class="pa-1">
                    <NodeDatePicker
                      :rules="form.rules.bornAt"
                      :value="formData.bornAt"
                      label="Date of birth"
                      @date="formData.bornAt = $event"
                      :readonly="!isEditing"
                    />
                  </v-col>
                  <!-- Order of Birth -->
                  <v-col cols="12" class="pa-1" v-if="formData.birthOrder || isEditing">
                    <v-text-field
                      v-model="formData.birthOrder"
                      type="number"
                      label="Order of birth"
                      v-bind="customProps"
                      min="1"
                    />
                  </v-col>
                  <!-- diedAt checkbox -->
                  <v-col cols="12" v-if="isEditing" class="pa-1">
                    <v-checkbox
                      v-model="formData.isDeceased"
                      label="No longer living"
                      :hide-details="true"
                    />
                  </v-col>
                  <!-- diedAt datepicker -->
                  <v-col cols="12" class="pa-1" v-if="formData.diedAt || isEditing">
                    <NodeDatePicker
                      v-if="formData.isDeceased"
                      :readonly="!isEditing"
                      label="Date of death"
                      :value="formData.diedAt"
                      @date="formData.diedAt = $event"
                    />
                  </v-col>
                  <!-- Gender View Mode -->
                  <v-col v-if="!isEditing" cols="12" sm="6" class="pa-1">
                    <v-text-field
                      v-if="!isEditing"
                      v-model="formData.gender"
                      label="Gender"
                      v-bind="customProps"
                    />
                  </v-col>
                  <!-- Gender Edit Mode -->
                  <v-col v-else cols="12" sm="8" class="pa-1">
                    <small>Gender</small>
                    <v-radio-group v-model="formData.gender" row class="mt-0 pt-0" hide-details>
                      <v-radio
                        v-for="(gender, index) in genders"
                        :value="gender"
                        :key="index"
                        :label="gender"
                        class="ma-0 pa-0 pr-2"
                      />
                    </v-radio-group>
                  </v-col>
                  <!-- Related By view mode-->
                  <!-- TODO: hide if relationship is unknown -->
                  <v-col
                    v-if="!isEditing && formData.relationshipType"
                    cols="6"
                    sm="4"
                    class="pa-1"
                  >
                    <v-text-field
                      v-model="formData.relationshipType"
                      label="Related By"
                      v-bind="customProps"
                    />
                  </v-col>
                  <!-- Related By edit mode-->
                  <v-col v-if="isEditing && warnAboutChildren" cols="6" class="pa-1">
                    <v-select
                      v-model="formData.relationshipType"
                      label="Related By"
                      placeholder=" "
                      :rules="form.rules.relationshipType"
                      :items="relationshipTypes"
                      :menu-props="{ light: true }"
                      :append-icon="!isEditing ? '' : 'mdi-chevron-down'"
                      :hide-details="true"
                      :class="!isEditing ? 'custom' : ''"
                    />
                  </v-col>
                  <v-col cols="12" class="pa-1">
                    <v-text-field
                      v-model="formData.profession"
                      label="Profession"
                      v-bind="customProps"
                    />
                  </v-col>
                  <v-col v-if="!formData.isDeceased" cols="12" class="pa-1">
                    <v-text-field
                      v-model="formData.contact"
                      label="Contact"
                      v-bind="customProps"
                    />
                  </v-col>
                  <v-col cols="12" class="pa-1">
                    <v-text-field
                      v-model="formData.location"
                      label="Region, Country"
                      v-bind="customProps"
                    />
                  </v-col>
                  <!-- Description textarea -->
                  <v-col cols="12" class="pa-1" v-if="formData.description || isEditing">
                    <v-textarea
                      v-if="formData.description || showDescription"
                      v-model="formData.description"
                      label="Description"
                      placeholder=" "
                      :hide-details="true"
                      :readonly="!isEditing"
                      :class="!isEditing ? 'custom' : ''"
                      no-resize
                      rows="1"
                      auto-grow
                    ></v-textarea>
                    <!-- Description button -->
                    <AddButton v-else label="Add description" @click="toggleDescription" row />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-divider v-if="!isEditing" />
            <v-row v-if="!isEditing" justify-sm="space-around">
              <!-- Family Members -->
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

              <v-divider v-if="profile.siblings" inset />
              <v-col :cols="12" v-if="profile.siblings" class="pa-0">
                <AvatarGroup
                  :profiles="profile.siblings"
                  group-title="Siblings"
                  size="60px"
                  :show-labels="true"
                  @profile-click="openProfile($event)"
                />
              </v-col>
              <v-divider inset />
              <v-col :cols="12" class="pa-0">
                <AvatarGroup
                  :profiles="profile.children"
                  group-title="Children"
                  size="60px"
                  :show-labels="true"
                  @profile-click="openProfile($event)"
                >
                  <AddButton @click="toggleNew('child')" />
                </AvatarGroup>
              </v-col>
              <!-- END Family Members -->
            </v-row>
            <v-row>
              <!-- Action buttons -->
              <!-- Delete button -->
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
                :align="mobile ? '' : 'right'"
                :class="{
                  'pt-0': true,
                  'd-flex': mobile,
                  'justify-space-between': mobile
                }"
              >
                <v-btn @click="cancel" text large fab class="secondary--text mr-10">
                  <v-icon color="secondary">mdi-close</v-icon>
                </v-btn>
                <v-btn @click="submit" text large fab class="blue--text ml-5" color="blue">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </v-col>
              <!-- END Action buttons -->
            </v-row>
          </v-card-text>
        </v-container>
      </v-card>
    </v-form>
  </div>
</template>

<script>
import {
  GENDERS,
  RULES,
  RELATIONSHIPS
} from '@/lib/constants'

import { PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/profile-helpers'

import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import AddButton from '@/components/button/AddButton.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import Appbar from '@/components/Appbar.vue'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

function defaultData (profile) {
  return {
    id: profile.id,
    gender: profile.gender,
    legalName: profile.legalName,
    bornAt: profile.bornAt,
    diedAt: profile.diedAt,
    preferredName: profile.preferredName,
    avatarImage: profile.avatarImage,
    description: profile.description,
    birthOrder: profile.birthOrder,
    relationshipType: profile.relationship ? profile.relationship.relationshipType ? profile.relationship.relationshipType : null : null,
    location: profile.location,
    contact: profile.contact,
    profession: profile.profession,
    altNames: {
      currentState: clone(profile.altNames),
      add: [], // new altNames to add
      remove: [] // altNames to remove
    },
    isDeceased: !!profile.diedAt // set to true if this value is set
  }
}

export default {
  name: 'SideViewEditNodeDialog',
  components: {
    Avatar,
    AvatarGroup,
    NodeDatePicker,
    AddButton,
    ImagePicker,
    Appbar
  },
  props: {
    goBack: { type: Function },
    profile: { type: Object, required: true },
    deleteable: { type: Boolean, default: false },
    warnAboutChildren: { type: Boolean, default: true },
    sideMenu: { type: Boolean, default: false },
    relationshipLinks: { type: Array }
  },

  data () {
    return {
      genders: GENDERS,
      // titles: TITLES,
      permitted: PERMITTED_PROFILE_ATTRS,
      relationshipTypes: RELATIONSHIPS,
      isEditing: false,
      formData: defaultData(this.profile),
      showDescription: false,
      deleteDialog: false,
      form: {
        valid: true,
        rules: RULES
      }
    }
  },
  computed: {
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
              if (value && value !== this.profile.relationship.relationshipType) {
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
    'formData.isDeceased' (newValue) {
      if (!newValue) this.formData.diedAt = ''
    }
  },
  methods: {
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
    openProfile (profileId) {
      this.$emit('open-profile', profileId)
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

</style>
