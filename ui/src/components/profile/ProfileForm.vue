<template>
  <v-form ref="form" light class="px-4">
    <v-row>
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
            :showPicker="!isEditing"
            :isSideViewDialog="isSideViewDialog"
            :placeHolder="!showAvatar"
            @updateAvatar="formData.avatarImage = $event"
          />
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
      </v-col>

      <!-- Names -->
      <v-col cols="12" :sm="smScreen ? '12' : '6'" class="py-0">
        <v-spacer style="height:5%"></v-spacer>
        <v-row>
          <!-- Full Name -->
          <v-col cols="12" class="pa-1">
            <slot name="search">
              <v-text-field
                v-model="formData.legalName"
                :label="t('legalName')"
                v-bind="customProps"
                outlined
              />
            </slot>
          </v-col>
          <!-- Preferred Name -->
          <v-col cols="12" class="pa-1 pt-4">
            <v-text-field
            v-model="formData.preferredName"
            :label="t('preferredName')"
            v-bind="customProps"
            outlined
            />
          </v-col>
        </v-row>

        <v-row>
          <!-- No longer living -->
          <v-col v-if="$route.name !== 'login'" :cols="sideViewCols" class="pt-0">
            <v-checkbox
              v-model="formData.deceased"
              :label="t('notLiving')"
              hide-details
              v-bind="customProps"
              outlined
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row :class="smScreen ? 'sideView-gender-button-row' : 'gender-button-row'">
    <!-- GENDER VIEW -->
      <v-col  v-if="readonly" class="pa-1">
        <v-text-field
          v-model="formData.gender"
          :label="t('gender.title')"
          v-bind="customProps"
          outlined
        />
      </v-col>
      <!-- GENDER EDIT -->
      <v-col v-if="!readonly" class="pa-1">
        <p class="text-field">{{ t('identity') }}</p>
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
      <div v-show="showAdvanced">
        <v-row>
          <!-- Full Name -->
          <v-col :cols="sideViewCols" class="pa-1">
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
              :sm="smScreen ? '12' : '6'"
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
              :sm="smScreen ? '12' : '6'"
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
            <v-col>
              <AddButton :align="'flex-end'" :justify="justifyBtn" :width="'50px'" :label="t('addName')" @click="addAltNameField" row/>
            </v-col>
          </template>
        </v-row>
        <v-row>
          <!-- DATE OF BIRTH + DATE OF DEATH-->
          <v-col :cols="sideViewCols" class="py-0">
            <DateIntervalPicker
              label="Date of birth"
              endLabel="Date of death"
              allowInterval
              :interval.sync="formData.aliveInterval"
              :hasEndDate.sync="formData.deceased"
              cols='12'
            />
          </v-col>
          <!-- Order of birth -->
          <v-col v-if="!readonly || formData.birthOrder" :cols="sideViewCols" :class="smScreen ? 'pa-1' : 'pa-1 mt-3'" >
            <v-text-field
               v-model="formData.birthOrder"
              type="number"
              :label="t('birthOrder')"
              min="1"
              v-bind="customProps"
              outlined
              :height="smScreen ? '' : '82px'"
            />
          </v-col>
        </v-row>
        <!-- Editing: relationship type-->
        <v-row >
          <v-col v-if="withRelationships || editRelationship || this.$route.name !== 'login'" :cols="sideViewCols" class="pa-1">
            <v-select
              v-model="formData.relationshipType"
              label="Related by"
              :items="relationshipTypes"
              outlined
              :menu-props="{light: true}"
            />
          </v-col>
          <v-col :cols="sideViewCols" :class="smScreen ? 'pa-1 mt-n7' : 'pa-1'">
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
          <v-col cols="12" :sm="mobile ? '12' : '6'">
            <!-- Email -->
            <v-row>
              <v-col cols="12" class="pa-1">
                <v-text-field
                  v-model="formData.email"
                  :label="t('email')"
                  v-bind="customProps"
                  outlined
                />
              </v-col>
            </v-row>
            <!-- Phone -->
            <v-row>
              <v-col cols="12" class="pa-1">
                <v-text-field
                  v-model="formData.phone"
                  :label="t('phone')"
                  v-bind="customProps"
                  outlined
                />
              </v-col>
            </v-row>
          </v-col>
          <template v-if="formData.deceased" >
            <v-col :cols="sideViewCols" :class="smScreen ? 'pa-1' : 'pa-1 mt-n7'">
              <v-text-field
                v-model="formData.placeOfDeath"
                label="Place of death"
                v-bind="customProps"
                outlined
              />
            </v-col>
            <v-col :cols="sideViewCols" :class="smScreen ? 'pa-1' : 'pa-1 mt-n7'">
              <!-- Burial Location -->
              <v-text-field
                v-model="formData.buriedLocation"
                label="Burial location"
                v-bind="customProps"
                outlined
              />
            </v-col>
          </template>

          <v-col cols="12" sm="12" :class="formData.deceased || smScreen ? 'pa-1' : 'pa-1 mt-n7'" >
            <!-- Description textarea -->
              <v-textarea
                v-model="formData.description"
                :label="t('description')"
                v-bind="customProps"
                no-resize
                rows="4"
                auto-grow
                outlined
              />
          </v-col>
        </v-row>

        <!-- Skills and Qualifications -->
        <v-row class="pt-2">
          <v-col cols="12">
            <span class="pa-0 ma-0" style="font-weight:bold">Skills and qualifications</span>
          </v-col>
          <!-- Profession-->
          <v-col cols="12" class="pa-0">
            <v-col :cols="sideViewCols" class="pa-1">
              <v-text-field
                v-model="formData.profession"
                label="Profession"
                v-bind="customProps"
                outlined
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
            label="Skill/qualification"
            append-icon="mdi-delete"
            @click:append="removeItem(formData.education, index)"
            v-bind="customProps"
            :readonly="readonly"
            outlined
            />
          </v-col>
          <v-col>
            <AddButton :align="'flex-end'" :justify="justifyBtn" :width="'50px'" label="Add a skill/qualification" @click="addEmptyItem(formData.education)" row/>
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
            label="Place of education"
            append-icon="mdi-delete"
            @click:append="removeItem(formData.school, index)"
            v-bind="customProps"
            :readonly="readonly"
            outlined
            />
          </v-col>
          <v-col>
            <AddButton :align="'flex-end'" :justify="justifyBtn" :width="'50px'" label="Add a place of education" @click="addEmptyItem(formData.school)" row/>
          </v-col>
        </v-row>
        <!-- Email, Address, Phone, Location -->
        <div v-if="!formData.deceased">
          <v-col cols="12">
            <span class="pa-0 ma-0" style="font-weight:bold">Personal Information</span>
          </v-col>
          <v-row class="py-1" v-if="!formData.deceased">
            <!-- Email -->
            <v-col :cols="sideViewCols" class="pa-1">
              <v-text-field
                v-model="formData.email"
                :label="t('email')"
                v-bind="customProps"
                outlined
              />
            </v-col>
            <!-- Phone -->
            <v-col :cols="sideViewCols" class="pa-1">
              <v-text-field
                v-model="formData.phone"
                :label="t('phone')"
                v-bind="customProps"
                outlined
              />
            </v-col>
          </v-row>
          <v-row>

          </v-row>
          <v-row>
            <!-- Address -->
            <v-col :cols="sideViewCols" class="pa-1">
              <v-text-field
                v-model="formData.address"
                :label="t('address')"
                v-bind="customProps"
                outlined
              />
            </v-col>
            <!-- City -->
            <v-col :cols="sideViewCols" class="pa-1">
              <v-text-field
                v-model="formData.city"
                :label="t('city')"
                v-bind="customProps"
                outlined
              />
            </v-col>
            <!-- Post Code -->
            <v-col :cols="sideViewCols" class="pa-1">
              <v-text-field
                v-model="formData.postCode"
                :label="t('postCode')"
                v-bind="customProps"
                outlined
              />
            </v-col>
            <!-- Country -->
              <v-col :cols="sideViewCols" class="pa-1">
                <v-text-field
                  v-model="formData.country"
                  :label="t('country')"
                  v-bind="customProps"
                  outlined
                />
              </v-col>
          </v-row>
        </div>
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
    smScreen () {
      return this.mobile || this.isSideViewDialog
    },
    sideViewCols () {
      return this.smScreen ? '12' : '6'
    },
    justifyBtn () {
      return this.smScreen ? 'start' : 'end'
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
