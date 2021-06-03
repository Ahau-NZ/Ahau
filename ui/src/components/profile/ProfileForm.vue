<template>
  <v-form ref="form" light class="px-4">
    <v-row :class="readonly ? 'pl-4':''">
      <!-- Upload profile photo -->
      <v-col :order="smScreen ? '' : '2'" class="py-0">
        <v-row :class="!isSideViewDialog || mobile ? 'justify-center pt-6' : 'justify-center ' ">
          <!-- Avatar -->
          <Avatar
            :class="showAvatar ? 'big-avatar' : 'big-avatar avatarPlaceholder'"
            size="140px"
            :image="formData.avatarImage"
            :alt="formData.preferredName"
            :gender="formData.gender"
            :aliveInterval="formData.aliveInterval"
            :deceased="formData.deceased"
            :isEditing="isEditing"
            :showPicker="!isEditing && !readonly"
            :isSideViewDialog="isSideViewDialog"
            :placeHolder="!showAvatar && !readonly"
            @updateAvatar="formData.avatarImage = $event"
          />
        </v-row>
        <v-row v-if="isEditing" class="justify-center">
          <h1>{{ t('addPersonFormTitle', { name: getDisplayName(formData) }) }}</h1>
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
      </v-col>

      <!-- Names -->
      <v-col cols="12" :sm="smScreen ? '12' : '6'" :class="mobile ? 'pt-4 pb-0':'py-0'">
        <v-spacer style="height:5%"></v-spacer>
        <v-row>
          <!-- Preferred Name -->
          <v-col cols="12" class="pa-1 pt-4">
            <slot name="search">
              <v-text-field
                v-model="formData.preferredName"
                :label="t('preferredName')"
                v-bind="customProps"
                outlined
              />
            </slot>
          </v-col>
          <v-col v-if="readonly" :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.gender"
              :label="t('genderIdentity')"
              v-bind="customProps"
            />
          </v-col>
          <v-col v-if="withRelationships" cols="6" class="pa-1 pt-2 pl-0">
            <v-select
              v-model="formData.relationshipType"
              label="Related by"
              :items="relationshipTypes"
              :menu-props="{ light: true }"
              outlined
              hide-details
            />
          </v-col>
          <!-- Order of birth -->
          <v-col v-if="showBirthOrder" cols="6" :class="mobile ? 'px-0 pt-2':'pt-2 px-0'" >
            <v-text-field
              v-model="formData.birthOrder"
              type="number"
              :label="t('birthOrder')"
              min="1"
              v-bind="customProps"
            />
          </v-col>
        </v-row>

        <!-- No longer living -->
        <v-row v-if="!isUser && !readonly" class="mb-8">
          <v-col :cols="sideViewCols" :class="mobile ? 'py-0 ':'pt-0'">
            <v-checkbox
              v-model="formData.deceased"
              :label="t('notLiving')"
              hide-details
              v-bind="customProps"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row :class="smScreen ? 'sideView-gender-button-row' : 'gender-button-row'">
      <!-- GENDER EDIT -->
      <v-col v-if="!readonly" class="pa-1 pt-6">
        <p class="text-field">{{ t('genderIdentity') }}</p>
        <v-row>
          <!-- TANE -->
          <v-col :cols="smScreen ? '3' : '2'" class="pa-0">
            <div class="gender-button" @click="updateSelectedGender('male')">
              <img ref="taneImg" :src="require('@/assets/tane-outlined.svg')" :class="smScreen ? 'gender-image-mobile': 'gender-image'">
              <p :class="smScreen ? 'sideView-gender-label-text text-field' : 'gender-label-text text-field'">{{ t('gender.male') }}</p>
            </div>
          </v-col>
          <!-- WAHINE -->
          <v-col :cols="smScreen ? '3' : '2'" class="pa-0 ml-6">
            <div class="gender-button" @click="updateSelectedGender('female')">
              <img ref="wahineImg" :src="require('@/assets/wahine-outlined.svg')" :class="smScreen ? 'gender-image-mobile':'gender-image'">
              <p :class="smScreen ? 'sideView-gender-label-text text-field' : 'gender-label-text text-field'">{{ t('gender.female') }}</p>
            </div>
          </v-col>
          <!-- DIVERSE -->
          <v-col :cols="smScreen ? '3' : '2'" class="pa-0 ml-6">
            <div class="gender-button" @click="updateSelectedGender('other')">
              <img ref="otherImg" :src="require('@/assets/diverse-outlined.svg')" :class="smScreen ? 'gender-image-mobile':'gender-image'">
              <p :class="smScreen ? 'sideView-gender-label-text text-field' : 'gender-label-text text-field'">{{ t('gender.other') }}</p>
            </div>
          </v-col>
          <div class="gender-checkbox-unknown">
            <v-col  v-if="!readonly || formData.gender === 'unknown'" cols="3">
              <v-checkbox v-model="formData.gender"
                value="unknown"
                :label="t('gender.unknown')" :hide-details="true"
                v-bind="customProps"
                outlined
                />
            </v-col>
          </div>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <slot name="addParents" v-if="typeIsChild">
      </slot>
      <slot name="addChildren" v-if="typeIsPartner || typeIsParent">
      </slot>
      <slot name="addPartners" v-if="typeIsParent">
      </slot>
    </v-row>

    <!-- Start of advanced section -->
    <v-divider />
      <v-card-actions class="pt-2 pb-2 pr-5 pointer">
        <v-row @click="showAdvanced = !showAdvanced" class="clickable">
          <v-col>
            <span class="pa-0 ma-0" style="font-weight:bold">{{ t('moreInfo') }}</span>
          </v-col>
          <v-btn icon right>
            <v-icon>{{ showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </v-row>
      </v-card-actions>
    <v-divider v-if="!showAdvanced" />
    <v-expand-transition>
      <div v-show="showAdvanced" :class="readonly && !mobile ? 'ml-5' : ''">
        <v-row>
          <!-- Full Name -->
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.legalName"
              :label="t('legalName')"
              v-bind="customProps"
            />
          </v-col>
          <!-- Alt names -->
          <template>
            <v-col v-for="(altName, index) in formData.altNames.currentState"
              :key="`value-alt-name-${index}`"
              cols="12"
              :sm="smScreen ? '12' : '6'"
              class="pa-1"
            >
              <v-text-field
                v-model="formData.altNames.currentState[index]"
                :label="t('aka')"
                :append-icon="readonly ? '' : 'mdi-delete'"
                @click:append="removeAltName(formData.altNames.currentState[index], index)"
                readonly
                v-bind="customProps"
              />
            </v-col>
          </template>

          <template v-if="!readonly">
            <v-col v-for="(altName, index) in formData.altNames.add"
              :key="`add-alt-name-${index}`"
              cols="12"
              :sm="smScreen ? '12' : '6'"
              class="pa-1"
            >
              <v-text-field
                v-model="formData.altNames.add[index]"
                label="Also known as"
                :append-icon="readonly ? '' : 'mdi-delete'"
                @click:append="removeAltNameField(index)"
                v-bind="customProps"
                cols="12"
              />
            </v-col>
            <v-col>
              <AddButton :align="'flex-end'" :justify="justifyBtn" :width="'50px'" :label="t('addName')" @click="addAltNameField" row/>
            </v-col>
          </template>
        </v-row>
        <v-row>
          <!-- DATE OF BIRTH + DATE OF DEATH-->
          <v-col cols="12" class="py-0">
            <DateIntervalPicker
              :label="t('dob.title')"
              :endLabel="t('dod')"
              allowInterval
              :interval.sync="formData.aliveInterval"
              :hasEndDate.sync="formData.deceased"
              :cols='sideViewCols'
              :readonly="readonly"
            />
          </v-col>

        </v-row>
        <!-- Editing: relationship type-->
        <v-row >
          <!-- <v-col v-if="(withRelationships || editRelationship || $route.name !== 'login') && !readonly" :cols="sideViewCols" class="pa-1">
            <v-select
              v-model="formData.relationshipType"
              label="Related by"
              :items="relationshipTypes"
              :menu-props="{ light: true }"
              outlined
              hide-details
            />
          </v-col> -->
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.placeOfBirth"
              :label="t('birthPlace')"
              v-bind="customProps"
            />
          </v-col>
          <template v-if="formData.deceased">
            <v-col :cols="sideViewCols" class="pa-1">
              <v-text-field
                v-model="formData.placeOfDeath"
                :label="t('deathPlace')"
                v-bind="customProps"
              />
            </v-col>
            <v-col :cols="sideViewCols" class="pa-1">
              <!-- Burial Location -->
              <v-text-field
                v-model="formData.buriedLocation"
                :label="t('burialLocation')"
                v-bind="customProps"
              />
            </v-col>
          </template>

          <v-col cols="12" sm="12" class="pa-1" >
            <!-- Description textarea -->
              <v-textarea
                v-model="formData.description"
                :label="t('description')"
                v-bind="customProps"
                no-resize
                :rows="readonly ? 0 : 3"
                auto-grow
              />
          </v-col>
        </v-row>

        <!-- Skills and Qualifications -->
        <v-row class="pt-2">
          <v-col cols="12" class="px-0">
            <v-divider class="py-2"/>
            <span class="pa-0 ma-0" style="font-weight:bold">{{ t('skills.title') }}</span>
          </v-col>
          <!-- Profession-->
          <v-col cols="12" class="pa-0">
            <v-col :cols="sideViewCols" class="pa-1">
              <v-text-field
                v-model="formData.profession"
                :label="t('skills.profession')"
                v-bind="customProps"
              />
            </v-col>
          </v-col>
          <!-- Skills -->
          <v-col v-for="(qualification, index) in formData.education"
            :key="`add-qual-name-${index}`"
            :cols="smScreen ? '12':'6'"
            class="pa-1"
          >
            <v-text-field
              v-model="formData.education[index]"
              :label="t('skills.skillsQuals')"
              :append-icon="!readonly ? 'mdi-delete':''"
              @click:append="removeItem(formData.education, index)"
              v-bind="customProps"
              :readonly="readonly"
            />
          </v-col>
          <v-col v-if="!readonly">
            <AddButton :align="'flex-end'" :justify="justifyBtn" :width="'50px'" :label="t('skills.addSkill')" @click="addEmptyItem(formData.education)" row/>
          </v-col>
        </v-row>
        <!-- Education -->
        <v-row class="pb-1">
          <v-col v-for="(school, index) in formData.school"
            :key="`add-school-name-${index}`"
            :cols="smScreen ? '12':'6'"
            class="pa-1"
          >
            <v-text-field
            v-model="formData.school[index]"
            :label="t('skills.placeOfEducation')"
            :append-icon="readonly ? '' : 'mdi-delete'"
            @click:append="removeItem(formData.school, index)"
            v-bind="customProps"
            :readonly="readonly"
            />
          </v-col>
          <v-col v-if="!readonly">
            <AddButton :align="'flex-end'" :justify="justifyBtn" :width="'50px'" :label="t('skills.addEducation')" @click="addEmptyItem(formData.school)" row/>
          </v-col>
        </v-row>
        <!-- Email, Address, Phone, Location -->
        <v-row v-if="!formData.deceased">
          <v-col cols="12" class="px-0">
            <v-divider class="py-2"/>
            <span class="pa-0 ma-0" style="font-weight:bold">{{ t('personalInfo.title') }}</span>
          </v-col>
          <!-- Email -->
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.email"
              :label="t('personalInfo.email')"
              v-bind="customProps"
            />
          </v-col>
          <!-- Phone -->
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.phone"
              :label="t('personalInfo.phone')"
              v-bind="customProps"
            />
          </v-col>
          <!-- Address -->
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.address"
              :label="t('personalInfo.address')"
              v-bind="customProps"
            />
          </v-col>
          <!-- City -->
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.city"
              :label="t('personalInfo.city')"
              v-bind="customProps"
            />
          </v-col>
          <!-- Post Code -->
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.postCode"
              :label="t('personalInfo.postCode')"
              v-bind="customProps"
            />
          </v-col>
          <!-- Country -->
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.country"
              :label="t('personalInfo.country')"
              v-bind="customProps"
            />
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
    <!-- End of advanced section -->
  </v-form>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import AddButton from '@/components/button/AddButton.vue'
import DateIntervalPicker from '@/components/DateIntervalPicker.vue'

import { GENDERS, RELATIONSHIPS } from '@/lib/constants'
import { getDisplayName } from '@/lib/person-helpers.js'
import { downloadKeys } from '@/lib/key-backup.js'

import isEmpty from 'lodash.isempty'

export default {
  name: 'ProfileForm',
  components: {
    Avatar,
    AddButton,
    DateIntervalPicker
  },
  props: {
    profile: { type: Object, required: true },
    withRelationships: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false },
    isSideViewDialog: { type: Boolean, default: false },
    dialogType: { type: String, default: '' },
    type: String
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
    if (!this.readonly && isEmpty(this.formData.education)) {
      this.formData.education.push('')
    }
    if (!this.readonly && isEmpty(this.formData.school)) {
      this.formData.school.push('')
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
    showBirthOrder () {
      if (this.dialogType === 'parent') return false
      if (this.readonly && !this.formData.birthOrder) return false
      else return true
    },
    showAvatar () {
      if (this.isEditing) return true
      if (this.formData) {
        if (!isEmpty(this.formData.gender)) return true
        if (!isEmpty(this.formData.avatarImage)) return true
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
        light: true,
        outlined: !this.readonly
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
    smScreen () {
      return this.mobile || this.isSideViewDialog
    },
    sideViewCols () {
      return this.smScreen ? '12' : '6'
    },
    justifyBtn () {
      return this.smScreen ? 'start' : 'end'
    },
    typeIsChild () {
      return this.dialogType === 'child' || this.dialogType === 'sibling'
    },
    typeIsPartner () {
      return this.dialogType === 'partner'
    },
    typeIsParent () {
      return this.dialogType === 'parent'
    }
  },
  methods: {
    getDisplayName,
    downloadKeys,
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
    addEmptyItem (array) {
      array.push('')
    },
    removeItem (array, index) {
      array.splice(index, 1)
    },
    t (key, vars) {
      return this.$t('addPersonForm.' + key, vars)
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
    margin-bottom: -10px;
    position: relative;
    top: -30px;
    }

  .sideView-gender-button-row {
    width: 100%;
    margin: 0px;
    margin-bottom: -10px;
    position: relative;
    }

  .gender-button {
    width: auto;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;

    .gender-image {
      margin-top:0px;
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

    .gender-image-mobile {
      width: 5em;
      height: 5em;
      border: 0.5px solid rgba(0,0,0,0.6);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border: 2px solid rgba(0,0,0,0.87);
      }
    }

  }

  .gender-checkbox-unknown {
      padding-bottom: 10px;
  }
  .gender-label-text {
    position: absolute;
    top: 90%;
  }

  .sideView-gender-label-text {
    position: absolute;
    top: 60%;
  }

  /* grey circle outline with plus */
  .avatarPlaceholder {
    width: 140px;
    height: 140px;
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
