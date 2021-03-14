<template>
  <v-form ref="form" light class="px-4">
    <v-row>
      <!-- Upload profile photo -->
      <v-col :order="mobile ? '' : '2'" class="py-0">
        <v-row v-if="showAvatar" class="justify-center pt-12">
          <!-- <v-col cols="12" class="pa-0" > -->
            <!-- Avatar -->
          <Avatar
            class="big-avatar"
            size="80px"
            :image="formData.avatarImage"
            :alt="formData.preferredName"
            :gender="formData.gender"
            :aliveInterval="formData.aliveInterval"
            :deceased="formData.deceased"
            :isEditing="isEditing"
            @updateAvatar="formData.avatarImage = $event"

          />
        </v-row>

        <v-row v-else class="justify-center pt-12">
          <!-- no avatar placeholder -->
          <div class="big-avatar avatarPlaceholder">
            <img :src="require('@/assets/account.svg')"/>
          </div>
        </v-row>

        <v-row v-if="isEditing" class="justify-center">
          <h1>Edit {{ getDisplayName(formData) }}</h1>
        </v-row>
        <v-row v-if="isEditing" class="justify-center">
          <v-btn
            @click="$emit('cancel')"
            color="white"
            text
            medium
            class="blue--text"
          >
            <v-icon small class="blue--text" left>mdi-close</v-icon>Cancel
          </v-btn>
        </v-row>
        <v-row>
          <!-- </v-col> -->
          <!-- Upload Profile Photo Button -->
          <v-col v-if="!readonly && !isEditing" cols="12" justify="center" align="center" class="pa-0">
            <ImagePicker @updateAvatar="formData.avatarImage = $event" :avatarLoaded="formData.avatarImage"/>
          </v-col>
        </v-row>
      </v-col>

      <!-- Names -->
      <v-col cols="12" :sm="mobile ? '12' : '6'" class="pt-4">
        <v-spacer style="height:5%"></v-spacer>
        <v-row>
          <!-- Preferred Name -->
          <v-col cols="12" class="pa-1">
            <v-text-field
            v-model="formData.preferredName"
            label="First name / knwon as"
            v-bind="customProps"
            outlined
            />
          </v-col>
        </v-row>
        <v-row>
          <!-- No longer living -->
          <v-col v-if="$route.name !== 'login'" cols='6' class="no-longer-living">
            <v-checkbox
              v-model="formData.deceased"
              label="No longer living"
              hide-details
              v-bind="customProps"
              outlined
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
    <!-- GENDER VIEW -->
      <v-col  v-if="readonly" class="pa-1">
        <v-text-field
          v-model="formData.gender"
          label="Gender"
          v-bind="customProps"
          outlined
        />
      </v-col>
      <!-- GENDER EDIT -->
      <v-col v-if="!readonly" class="pa-1">
        <p class="text-field">Identifies as</p>
        <v-row class="gender-button-row">
          <!-- TANE -->
          <v-col class="pa-0">
            <div class="gender-button" @click="updateSelectedGender('male')">
              <img ref="taneImg" :src="require('@/assets/tane-outlined.svg')" :class="mobile ? 'gender-image-mobile':'gender-image'">
            </div>
          </v-col>
          <!-- WAHINE -->
          <v-col class="pa-0">
            <div class="gender-button" @click="updateSelectedGender('female')">
              <img ref="wahineImg" :src="require('@/assets/wahine-outlined.svg')" :class="mobile ? 'gender-image-mobile':'gender-image'">
            </div>
          </v-col>
          <!-- DIVERSE -->
          <v-col class="pa-0">
            <div class="gender-button" @click="updateSelectedGender('other')">
              <img ref="otherImg" :src="require('@/assets/diverse-outlined.svg')" :class="mobile ? 'gender-image-mobile':'gender-image'">
            </div>
          </v-col>
          <div :class="isSideViewDialog ? 'gender-checkbox-unknown-side' : 'gender-checkbox-unknown-default'">
            <v-col  v-if="!readonly || formData.gender === 'unknown'" cols="3" class="pa-10 py-0">
              <v-checkbox v-model="formData.gender"
              value="unknown"
              label="Unknown" :hide-details="true"
              v-bind="customProps"
              outlined
              />
            </v-col>
          </div>
        </v-row>
        <v-row v-if="!isSideViewDialog" class="gender-label-row">
          <v-col class="pa-0">
            <p class="gender-label-text text-field">Male</p>
          </v-col>
          <v-col class="pa-0">
            <p class="gender-label-text text-field">Female</p>
          </v-col>
          <v-col class="pa-0">
            <p class="gender-label-text text-field">Other</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- Start of advanced section -->
    <v-divider />
      <v-card-actions class="pt-2 pb-2 px-5 pointer">
        <v-row @click="showAdvanced = !showAdvanced" class="clickable">
          <v-col>
            <span class="pa-0 ma-0">More info</span>
          </v-col>
          <v-btn icon right>
            <v-icon>{{ showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </v-row>
      </v-card-actions>
    <v-divider v-if="!showAdvanced" />
    <v-expand-transition>
      <div v-show="showAdvanced">
        <v-row>
          <!-- Full Name -->
          <v-col cols="6" class="pa-1">
            <slot name="search">
              <v-text-field
                v-model="formData.legalName"
                label="Full name"
                v-bind="customProps"
                outlined
              />
            </slot>
          </v-col>
          <!-- Alt names -->
          <template>
            <v-col v-for="(altName, index) in formData.altNames.currentState"
              :key="`value-alt-name-${index}`"
              cols="12"
              :sm="mobile ? '12' : '6'"
              class="pa-1"
            >
              <v-text-field
                v-model="formData.altNames.currentState[index]"
                label="Also known as"
                :append-icon="readonly ? '' : 'mdi-delete'"
                @click:append="removeAltName(formData.altNames.currentState[index], index)"
                readonly
                v-bind="customProps"
                outlined
              />
            </v-col>
          </template>

          <template v-if="!readonly">
            <v-col v-for="(altName, index) in formData.altNames.add"
              :key="`add-alt-name-${index}`"
              cols="12"
              :sm="mobile ? '12' : '6'"
              class="pa-1"
            >
              <v-text-field
                v-model="formData.altNames.add[index]"
                label="Also known as"
                append-icon="mdi-delete"
                @click:append="removeAltNameField(index)"
                v-bind="customProps"
                cols="12"
                outlined
              />
            </v-col>
            <AddButton :align="'flex-end'" :width="'50px'" label="Add another name" @click="addAltNameField" row/>
          </template>
        </v-row>
        <v-row>
          <!-- DATE OF BIRTH + DATE OF DEATH-->
          <v-col cols="6">
            <DateIntervalPicker
            label="Date of birth"
            endLabel="Date of death"
            allowInterval
            :interval.sync="formData.aliveInterval"
            :hasEndDate.sync="formData.deceased"

          />
          </v-col>
          <!-- Order of birth -->
          <v-col v-if="!readonly || formData.birthOrder" cols="6" class="pa-1">
            <v-spacer :style="formData.deceased ? 'height: 39%' : 'height: 31%'"></v-spacer>
            <v-text-field
              v-model="formData.birthOrder"
              type="number"
              label="Order of birth"
              min="1"
              v-bind="customProps"
              outlined
            />
          </v-col>
        </v-row>
        <!-- Editing: relationship type-->
        <v-row v-if="withRelationships || editRelationship">
          <v-col cols="12" class="pa-1" v-if="this.$route.name !== 'login'">
            <v-select
              v-model="formData.relationshipType"
              label="Related by"
              :items="relationshipTypes"
              outlined
              :menu-props="{light: true}"
            />
          </v-col>
        </v-row>
        <!-- Description, Profession, Place of Birth -->
        <v-row>
          <v-col cols="12" sm="12" class="py-0">
            <v-row>
              <!-- Description textarea -->
              <v-col cols="12" class="pa-1">
                <v-textarea
                  v-model="formData.description"
                  label="Description"
                  v-bind="customProps"
                  no-resize
                  rows="4"
                  auto-grow
                  outlined
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <!-- Qualification -->
        <v-row>
          <template v-if="readonly">
            <v-col v-for="(qualification, index) in formData.education"
              :key="`value-qual-name-${index}`"
              cols="12"
              sm="12"
              class="pa-1"
            >
              <v-text-field
              v-model="formData.education[index]"
              label="Skill/qualification"
              :append-icon="readonly ? '' : 'mdi-delete'"
              @click:append="removeQualification(index)"
              v-bind="customProps"
              readonly
              outlined
              />
            </v-col>
          </template>

          <template v-else>
            <v-col v-for="(qualification, index) in formData.education"
              :key="`add-qual-name-${index}`"
              cols="12"
              sm="12"
              class="pa-1"
            >
              <v-text-field
              v-model="formData.education[index]"
              label="Skill/qualification"
              append-icon="mdi-delete"
              @click:append="removeQualification(index)"
              v-bind="customProps"
              cols="12"
              outlined
              />
            </v-col>
          <v-col>
            <AddButton :align="'flex-end'" :width="'50px'" label="Add a skill/qualification" @click="addQualification" row/>
          </v-col>
          </template>
        </v-row>
        <!-- Education -->
        <v-row>
          <template v-if="readonly">
            <v-col v-for="(school, index) in formData.school"
              :key="`value-school-name-${index}`"
              cols="12"
              sm="12"
              class="pa-1"
            >
              <v-text-field
              v-model="formData.school[index]"
              label="Place of education"
              :append-icon="readonly ? '' : 'mdi-delete'"
              @click:append="removeSchool(index)"
              v-bind="customProps"
              readonly
              outlined
              />
            </v-col>
          </template>

          <template v-else>
            <v-col v-for="(school, index) in formData.school"
              :key="`add-school-name-${index}`"
              cols="12"
              sm="12"
              class="pa-1"
            >
              <v-text-field
              v-model="formData.school[index]"
              label="Place of education"
              append-icon="mdi-delete"
              @click:append="removeSchool(index)"
              v-bind="customProps"
              cols="12"
              outlined
              />
            </v-col>
          <v-col>
            <AddButton :align="'flex-end'" :width="'50px'" label="Add a place of education" @click="addSchool" row/>
          </v-col>
          </template>
        </v-row>
        <!-- Profession, Place of Birth -->
        <v-row>
          <v-col :cols="isSideViewDialog ? 12 : 6" class="pa-1">
            <v-text-field
              v-model="formData.profession"
              label="Profession"
              v-bind="customProps"
              outlined
            />
          </v-col>
          <v-col :cols="isSideViewDialog ? 12 : 6" class="pa-1">
            <v-text-field
              v-model="formData.placeOfBirth"
              label="City/country of birth"
              v-bind="customProps"
              outlined
            />
          </v-col>
        </v-row>
        <!-- Email, Address, Phone, Location -->
        <v-row v-if="!formData.deceased">
          <!-- Email -->
          <v-col :cols="isSideViewDialog ? '12' : '6'" class="pa-1">
            <v-text-field
              v-model="formData.email"
              label="Email"
              v-bind="customProps"
              outlined
            />
          </v-col>
          <!-- Phone -->
          <v-col :cols="isSideViewDialog ? '12' : '6'" class="pa-1">
            <v-text-field
              v-model="formData.phone"
              label="Phone"
              v-bind="customProps"
              outlined
            />
          </v-col>
          <!-- Address -->
          <v-col :cols="isSideViewDialog ? '12' : '6'" class="pa-1">
            <v-text-field
              v-model="formData.address"
              label="Address"
              v-bind="customProps"
              outlined
            />
          </v-col>
          <!-- City -->
          <v-col :cols="isSideViewDialog ? '12' : '6'" class="pa-1">
            <v-text-field
              v-model="formData.city"
              label="City"
              v-bind="customProps"
              outlined
            />
          </v-col>
          <!-- Post Code -->
          <v-col :cols="isSideViewDialog ? '12' : '6'" class="pa-1">
            <v-text-field
              v-model="formData.postCode"
              label="Post Code"
              v-bind="customProps"
              outlined
            />
          </v-col>
          <!-- Country -->
            <v-col :cols="isSideViewDialog ? '12' : '6'" class="pa-1">
              <v-text-field
                v-model="formData.country"
                label="Country"
                v-bind="customProps"
                outlined
              />
            </v-col>
        </v-row>
        <v-row v-if="formData.deceased">
          <v-col cols="12" :sm="mobile ? '12' : '6'">
            <!-- Place of Death -->
            <v-row>
              <v-col cols="12" class="pa-1">
                <v-text-field
                  v-model="formData.placeOfDeath"
                  label="Place of death"
                  v-bind="customProps"
                  outlined
                />
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" :sm="mobile ? '12' : '6'">
            <v-row>
              <v-col cols="12" class="pa-1">
                <!-- Burial Location -->
                <v-text-field
                  v-model="formData.buriedLocation"
                  label="Burial location"
                  v-bind="customProps"
                  outlined
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
    <!-- End of advanced section -->
  </v-form>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import AddButton from '@/components/button/AddButton.vue'
import DateIntervalPicker from '@/components/DateIntervalPicker.vue'

import { GENDERS, RELATIONSHIPS } from '@/lib/constants'
import { getDisplayName } from '@/lib/person-helpers.js'

import isEmpty from 'lodash.isempty'

export default {
  name: 'ProfileForm',
  components: {
    Avatar,
    ImagePicker,
    AddButton,
    DateIntervalPicker
  },
  props: {
    profile: { type: Object, required: true },
    withRelationships: { type: Boolean, default: true },
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false },
    editRelationship: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false },
    isSideViewDialog: { type: Boolean, default: false }
  },
  data () {
    return {
      genders: GENDERS,
      relationshipTypes: RELATIONSHIPS,
      formData: {},
      form: {
        valid: true,
        showDescription: false
      },
      selectedGender: '',
      showAdvanced: false
    }
  },
  mounted () {
    if (this.formData.gender) {
      this.updateSelectedGender(this.formData.gender)
    }
    if (isEmpty(this.formData.relationshipType)) {
      this.formData.relationshipType = 'birth'
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (newVal, oldVal) {
        this.formData = newVal
      }
    },
    'formData.gender' (newValue) {
      if (newValue === 'other') this.updateSelectedGender('other')
      if (newValue === 'unknown') this.updateSelectedGender('unknown')
    }
  },
  computed: {
    showAvatar () {
      if (this.isEditing) return true
      if (this.formData) {
        if (this.formData.gender) return true
        if (this.formData.avatarImage) return true
        else return false
      } else return false
    },
    customProps () {
      // readonly = hasSelected || !isEditing
      return {
        readonly: this.readonly,
        flat: this.readonly,
        hideDetails: true,
        placeholder: ' ',
        class: this.readonly ? 'custom' : '',
        light: true
      }
    },
    showLegallyAdopted () {
      switch (this.formData.relationshipType) {
        case 'whangai': return true
        case 'adopted': return true
        default: return false
      }
    },
    altNames () {
      return [...this.formData.altNames.value, ...this.formData.altNames.add]
    },
    contactColOrdering () {
      return this.isSideViewDialog ? '6' : '12'
    }
  },
  methods: {
    getDisplayName,
    updateSelectedGender (genderClicked) {
      // reset images to outlined
      this.$refs.taneImg.src = require('@/assets/tane-outlined.svg')
      this.$refs.wahineImg.src = require('@/assets/wahine-outlined.svg')
      this.$refs.otherImg.src = require('@/assets/diverse-outlined.svg')
      // hightlight selected image
      this.genderSelected = genderClicked
      if (this.genderSelected === 'male') {
        this.$refs.taneImg.src = require('@/assets/tane.svg')
      }
      if (this.genderSelected === 'female') {
        this.$refs.wahineImg.src = require('@/assets/wahine.svg')
      }
      if (this.genderSelected === 'other') {
        this.$refs.otherImg.src = require('@/assets/diverse.svg')
      }
      // update the gender
      this.formData.gender = this.genderSelected
    },
    addAltNameField () {
      this.formData.altNames.add.push(null)
    },
    removeAltName (altName, index) {
      this.formData.altNames.currentState.splice(index, 1)
      this.formData.altNames.remove.push(altName)
    },
    removeAltNameField (index) {
      this.formData.altNames.add.splice(index, 1)
    },
    addQualification () {
      this.formData.education.push('')
    },
    removeQualification (index) {
      this.formData.education.splice(index, 1)
    },
    addSchool () {
      this.formData.school.push('')
    },
    removeSchool (index) {
      this.formData.school.splice(index, 1)
    }
  }
}
</script>

<style scoped lang="scss">
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

  .v-text-field input {
    text-align: center !important;
  }

  .text-field {
    color: rgba(0,0,0,0.6);
    font-size: 0.8em;
    margin: 0;
  }

  .radio-button  > input[type="radio"] {
    opacity: 0;
    position: fixed;
    width: 0;
  }

  .radio-button >  label {
      display: inline-block;
      background-color: #ddd;
      padding: 10px 20px;
      font-family: sans-serif, Arial;
      font-size: 16px;
      border: 2px solid #444;
      border-radius: 4px;
  }

  .radio-button >  label:hover {
    background-color: #dfd;
  }

  .radio-button >  input[type="radio"]:focus + label {
      border: 2px dashed #444;
  }

  .radio-button >  input[type="radio"]:checked + label {
      background-color: #bfb;
      border-color: #4c4;
  }

  .gender-button-row {
    width: 100%;
    margin: 0px;

    .gender-button {
      width: auto;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 5px;

      .gender-image {
        margin-top:30px;
        width: 8em;
        height: 8em;
        border: 0.5px solid rgba(0,0,0,0.6);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border: 2px solid rgba(0,0,0,0.87);
        }
      }

      .gender-image-mobile {
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

    .gender-checkbox-unknown-default {
        padding: 50px 0px 0px 0px;
    }
    .gender-checkbox-unknown-side {
        padding: 0px 0px 15px 0px;
    }
  }

    .gender-label-row {
      width: 75%;
      margin: 0px;
      padding-top: 20px;

      .gender-label-text {
        text-align: center;
      }
    }

  /* grey circle outline with plus */
  .avatarPlaceholder {
    width: 200px;
    height: 200px;
    border: 0.3px solid rgb(118, 118, 118,0.9);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size:2rem;
    color:rgba(0, 0, 0, 0.54)
  }

  .pointer {
    cursor: pointer;
  }
</style>
