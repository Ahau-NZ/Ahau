<template>
  <v-form
    v-model="valid"
    ref="form"
    light
    class="px-4"
  >
    <v-row :class="readonly ? 'pl-4' : ''">
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
          <h1>{{ t('addPersonFormTitle', { displayName: getDisplayName(formData) }) }}</h1>
        </v-row>
        <v-row v-if="isEditing && !isSideViewDialog" class="justify-center">
          <v-btn
            @click="$emit('cancel')"
            color="white"
            text
            medium
            class="blue--text"
            style="z-index: 100;"
          >
            <v-icon small class="blue--text" left>mdi-close</v-icon>Cancel
          </v-btn>
        </v-row>
      </v-col>

      <!-- Names -->
      <v-col cols="12" :sm="smScreen ? '12' : '6'" :class="mobile ? 'pt-4 pb-0' : 'py-0'">
        <v-spacer style="height:5%"></v-spacer>
        <v-row>
          <!-- Preferred Name -->
          <v-col cols="12" class="pa-1 pt-4">
            <slot name="search">
              <v-text-field
                ref="name"
                v-model="formData.preferredName"
                :label="t('preferredName')"
                v-bind="customProps"
                outlined
                :rules="getFieldRules('preferredName')"
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
              :label="t('relatedBy', { displayName })"
              :items="relationshipTypes"
              :menu-props="{ light: true }"
              outlined
              hide-details
              :rules="getFieldRules('relatedBy')"
            />
          </v-col>
          <!-- Order of birth -->
          <v-col v-if="showBirthOrder" cols="6" :class="mobile ? 'px-0 pt-2' : 'pl-1 pr-0 pt-2'" >
            <v-text-field
              v-model="formData.birthOrder"
              type="number"
              :label="t('birthOrder')"
              min="1"
              v-bind="customProps"
              :rules="getFieldRules('birthOrder')"
            />
          </v-col>
        </v-row>

        <!-- No longer living -->
        <v-row v-if="!isLoginPage && !readonly && hasDefaultField('isDeceased')" class="mb-8">
          <v-col :cols="sideViewCols" :class="mobile ? 'py-0 ' : 'pt-0'">
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

    <v-row v-if="hasDefaultField('gender')" :class="smScreen ? 'sideView-gender-button-row' : 'gender-button-row'" justify='start'>
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
              <img ref="wahineImg" :src="require('@/assets/wahine-outlined.svg')" :class="smScreen ? 'gender-image-mobile' : 'gender-image'">
              <p :class="smScreen ? 'sideView-gender-label-text text-field' : 'gender-label-text text-field'">{{ t('gender.female') }}</p>
            </div>
          </v-col>
          <!-- DIVERSE -->
          <v-col :cols="smScreen ? '3' : '2'" class="pa-0 ml-6">
            <div class="gender-button" @click="updateSelectedGender('other')">
              <img ref="otherImg" :src="require('@/assets/account-outlined.svg')" :class="smScreen ? 'gender-image-mobile' : 'gender-image'">
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

    <!-- If us duplicate -->
    <v-row v-if="isDuplicate" class="pl-4">
      <v-col cols="12" class="">
        <v-row>
          <p>{{ t('profileExists') }}</p>
        </v-row>
        <!-- <v-radio-group v-model="moveDup" row class="mt-0 ml-n2"> -->
        <v-radio-group :value="moveDup" @change="$emit('update:moveDup', $event)" row class="mt-0 ml-n2" mandatory>
          <v-radio
            :label="t('movePerson', { person: getDisplayName(formData), displayName })"
            :value="true"
          />
          <v-radio
            :value="false"
            :label="t('createLink', { person: getDisplayName(formData), displayName })"
          />
        </v-radio-group>
      </v-col>
    </v-row>

    <!-- Start of advanced section -->
    <v-divider v-if="hasDefaultField('gender')"/>
    <div :class="readonly && !mobile ? 'ml-5' : ''">
      <v-row>
        <!-- Full Name -->
        <v-col v-if="hasDefaultField('legalName')" :cols="sideViewCols" class="pa-1">
          <v-text-field
            v-model="formData.legalName"
            :label="t('legalName')"
            v-bind="customProps"
            :rules="getFieldRules('legalName')"
          />
        </v-col>
        <!-- Alt names -->
        <template v-if="hasDefaultField('altNames')" >
          <!-- TODO: configure required -->
          <v-col v-for="(altName, index) in currentAltNames"
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

        <!-- TODO: configure required -->
        <template v-if="!readonly && hasDefaultField('altNames')">
          <v-col v-for="(altName, index) in newAltNames"
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
            :rules="getFieldRules('dateOfBirth')"
          />
        </v-col>

      </v-row>
      <!-- Editing: relationship type-->
      <v-row>
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
        <v-col v-if="hasDefaultField('placeOfBirth')"  :cols="sideViewCols" class="pa-1">
          <v-text-field
            v-model="formData.placeOfBirth"
            :label="t('birthPlace')"
            v-bind="customProps"
          />
        </v-col>
        <template v-if="formData.deceased && hasDefaultField('placeOfDeath')">
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.placeOfDeath"
              :label="t('deathPlace')"
              v-bind="customProps"
            />
          </v-col>
          <v-col v-if="formData.deceased && hasDefaultField('buriedLocation')" :cols="sideViewCols" class="pa-1">
            <!-- Burial Location -->
            <v-text-field
              v-model="formData.buriedLocation"
              :label="t('burialLocation')"
              v-bind="customProps"
            />
          </v-col>
        </template>

        <v-col v-if="hasDefaultField('description')" cols="12" sm="12" class="pa-1" >
          <!-- Description textarea -->
            <v-textarea
              v-model="formData.description"
              :label="t('description', {displayName: formData.preferredName})"
              v-bind="customProps"
              no-resize
              :rows="readonly ? 0 : 3"
              auto-grow
            />
        </v-col>
      </v-row>

      <!-- Skills and Qualifications -->
      <v-row v-if="hasOneField(['profession', 'school', 'education'])" class="pt-2">
        <v-col cols="12" class="px-0">
          <v-divider class="py-2"/>
          <span class="pa-0 ma-0" style="font-weight:bold">{{ t('skills.title') }}</span>
        </v-col>
      </v-row>

      <v-row v-if="hasDefaultField('profession')">
        <!-- Profession-->
        <v-col cols="12" class="pa-0">
          <v-col :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.profession"
              :label="t('skills.profession')"
              v-bind="customProps"
              :rules="getFieldRules('profession')"
            />
          </v-col>
        </v-col>
      </v-row>

        <!-- Skills -->
        <!-- TODO: configure required -->
      <v-row v-if="hasDefaultField('education')">
        <v-col v-for="(qualification, index) in formData.education"
          :key="`add-qual-name-${index}`"
          :cols="smScreen ? '12' : '6'"
          class="pa-1"
        >
          <v-text-field
            v-model="formData.education[index]"
            :label="t('skills.skillsQuals')"
            :append-icon="!readonly ? 'mdi-delete' : ''"
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
      <!-- TODO: configure required -->
      <v-row v-if="hasDefaultField('school')" class="pb-1">
        <v-col v-for="(school, index) in formData.school"
          :key="`add-school-name-${index}`"
          :cols="smScreen ? '12' : '6'"
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

      <v-row v-if="!formData.deceased && hasOneField(['email', 'phone', 'address', 'postCode', 'city', 'country'])">
        <!-- Personal Information -->
        <template v-if="showPersonalInfo">
          <v-col cols="12" class="px-0">
            <v-divider class="py-2"/>
            <span class="pa-0 ma-0" style="font-weight:bold">{{ t('personalInfo.title') }}</span>
            <span class="pa-0 pl-2 ma-0" style="font-style:italic">({{ t('kaitiakiOnly') }})</span>
          </v-col>
          <!-- Email -->
          <v-col v-if="hasDefaultField('email')" :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.email"
              :label="t('personalInfo.email')"
              v-bind="customProps"
              :rules="getFieldRules('email')"
            />
          </v-col>
          <!-- Phone -->
          <v-col v-if="hasDefaultField('phone')" :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.phone"
              :label="t('personalInfo.phone')"
              v-bind="customProps"
              :rules="getFieldRules('phone')"
            />
          </v-col>
          <!-- Address -->
          <v-col v-if="hasDefaultField('address')" :cols="sideViewCols" class="pa-1">
            <v-text-field
              v-model="formData.address"
              :label="t('personalInfo.address')"
              v-bind="customProps"
              :rules="getFieldRules('address')"
            />
          </v-col>
        </template>
        <!-- Post Code -->
        <v-col v-if="hasDefaultField('postCode')" :cols="sideViewCols" class="pa-1">
          <v-text-field
            v-model="formData.postCode"
            :label="t('personalInfo.postCode')"
            v-bind="customProps"
            :rules="getFieldRules('postCode')"
          />
        </v-col>
        <!-- City -->
        <v-col v-if="hasDefaultField('city')" :cols="sideViewCols" class="pa-1">
          <v-text-field
            v-model="formData.city"
            :label="t('personalInfo.city')"
            v-bind="customProps"
            :rules="getFieldRules('city')"
          />
        </v-col>
        <!-- Country -->
        <v-col v-if="hasDefaultField('country')" :cols="sideViewCols" class="pa-1">
          <v-text-field
            v-model="formData.country"
            :label="t('personalInfo.country')"
            v-bind="customProps"
            :rules="getFieldRules('country')"
          />
        </v-col>
      </v-row>
      <template v-if="showCustomFieldsSection">
        <!-- ====COMMUNITY FIELDS======== -->
        <v-col cols="12" class="px-0">
          <v-divider class="py-2"/>
          <span class="pa-0 ma-0" style="font-weight:bold">{{ t('communityFieldsTitle') }}</span>
        </v-col>
        <!-- Groups custom fields into tribes -->
        <v-row v-for="tribe in customFieldsByTribes" :key="tribe.tribeId">
          <CustomFieldGroup
            :tribe="tribe"
            :profile="tribe.profileInTribe"
            :readonly="readonly"
            :sideView="isSideViewDialog"
            :fieldValues.sync="formData.customFields[tribe.tribeId]"
            :isRegistration="isRegistration"
          />
        </v-row>
      </template>
    </div>
  </v-form>
</template>

<script>
import Avatar from '@/components/Avatar.vue'
import AddButton from '@/components/button/AddButton.vue'
import DateIntervalPicker from '@/components/DateIntervalPicker.vue'
import CustomFieldGroup from '@/components/profile/CustomFieldGroup.vue'

import { GENDERS, RELATIONSHIPS } from '@/lib/constants'
import { getDisplayName } from '@/lib/person-helpers.js'
import { getCustomFields, mapPropToLabel } from '@/lib/custom-field-helpers'

import isEmpty from 'lodash.isempty'
import get from 'lodash.get'

import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ProfileForm',
  components: {
    Avatar,
    AddButton,
    DateIntervalPicker,
    CustomFieldGroup
  },
  props: {
    profile: { type: Object, required: true },
    type: String,
    dialogType: { type: String, default: '' },
    displayName: { type: String, default: '' },
    moveDup: { type: Boolean, default: true },
    isRegistration: Boolean,
    withRelationships: Boolean,
    readonly: Boolean,
    hideDetails: Boolean,
    isEditing: Boolean,
    isSideViewDialog: Boolean,
    showCustomFields: Boolean,
    fullForm: Boolean,
    isDuplicate: Boolean
  },
  data () {
    return {
      genders: GENDERS,
      relationshipTypes: RELATIONSHIPS,
      formData: {},
      valid: false,
      selectedGender: '',
      showAdvanced: false,
      rules: [value => !!value || 'Required.']
    }
  },
  mounted () {
    this.$refs.form.validate()

    if (this.fullForm) this.showAdvanced = true
    if (this.formData.gender) {
      this.updateSelectedGender(this.formData.gender)
    }
    if (!this.readonly && isEmpty(this.formData.education)) {
      this.formData.education = []
      // this.formData.education.push('')
    }
    if (!this.readonly && isEmpty(this.formData.school)) {
      this.formData.school = []
      // this.formData.school.push('')
    }
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (Array.isArray(this.profile.customFields) && !this.isLoginPage && this.currentTribe) {
          this.formData.customFields = {
            [this.currentTribe.id]: {
              ...(this.profile.customFields || []).reduce((acc, field) => {
                return ({ ...acc, [field.key]: field.value })
              }, {})
            }
          }
        }

        this.formData = newVal
      }
    },
    'formData.gender' (newValue) {
      if (newValue === 'other') this.updateSelectedGender('other')
      if (newValue === 'unknown') this.updateSelectedGender('unknown')
    },
    valid (valid) {
      this.setAllowSubmissions(valid)
    }
  },
  computed: {
    ...mapGetters(['isKaitiaki', 'whoami', 'isMyProfile', 'getPersonalProfileInTribe']),
    ...mapGetters('tribe', ['tribeProfile', 'currentTribe', 'tribeCustomFields', 'joinedTribes', 'tribeRequiredDefaultFields', 'tribeDefaultFields']),
    ...mapGetters('person', ['person']),
    currentAltNames () {
      return get(this.formData, 'altNames.currentState', [])
    },
    newAltNames () {
      return get(this.formData, 'altNames.add', [])
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    originalProfile () {
      if (Array.isArray(this.profile.customFields)) return this.profile
      return this.person(this.profile.id)
    },
    isLoginPage () {
      return this.$route.name === 'login'
    },
    isPersonalProfilePage () {
      return (this.profile.id === this.whoami.personal.profile.id)
    },
    showPersonalInfo () {
      return this.isKaitiaki || this.isMyProfile(this.profile.id)
    },
    showBirthOrder () {
      if (!this.hasDefaultField('birthOrder')) return false
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
    },
    /*
    ======== custom fields ==========
    */
    showCustomFieldsSection () {
      if (!get(this.formData, 'customFields')) return false

      return this.customFieldsByTribes.some(tribe => get(tribe, 'customFields.length'))
    },
    customFieldsByTribes () {
      // Here if we are viewing our own profile on ProfileShow, we want to display
      // all custom fields from all tribes
      if (!this.showCustomFields && this.isPersonalProfilePage) {
        return this.joinedTribes.map(tribe => {
          return {
            tribeId: tribe.id,
            profileId: get(tribe, 'private[0].id'),
            preferredName: get(tribe, 'private[0].preferredName'),
            customFields: getCustomFields(get(tribe, 'public[0].customFields', []))
              .filter(field => !field.tombstone),
            profileInTribe: this.getPersonalProfileInTribe(tribe.id)
          }
        })
          .filter(tribe => get(tribe, 'customFields.length'))
      }

      if (!this.tribeCustomFields.length) return []

      // this means we only display the custom fields in the particular tribe we are in
      return [{
        tribeId: this.currentTribe.id,
        profileId: this.tribeProfile.id,
        preferredName: this.tribeProfile.preferredName,
        customFields: this.tribeCustomFields,
        // problem here, if we use this.profile, the original value of the custom fields gets overwritten
        profileInTribe: this.originalProfile
      }]
    }
  },
  methods: {
    ...mapMutations(['setAllowSubmissions']),
    getDisplayName,
    hasDefaultField (key) {
      if (!this.currentTribe) return false // avoid displaying any fields until the tribe has loaded

      const label = mapPropToLabel(key)
      if (!label) return

      // find in defaultCustomFields
      return this.tribeDefaultFields.some(field => field.label === label)
    },
    hasOneField (keys) {
      return keys.some(key => this.hasDefaultField(key))
    },
    updateSelectedGender (genderClicked) {
      // reset images to outlined
      this.$refs.taneImg.src = require('@/assets/tane-outlined.svg')
      this.$refs.wahineImg.src = require('@/assets/wahine-outlined.svg')
      this.$refs.otherImg.src = require('@/assets/account-outlined.svg')
      // hightlight selected image
      this.genderSelected = genderClicked
      if (this.genderSelected === 'male') {
        this.$refs.taneImg.src = require('@/assets/tane.svg')
      }
      if (this.genderSelected === 'female') {
        this.$refs.wahineImg.src = require('@/assets/wahine.svg')
      }
      if (this.genderSelected === 'other') {
        this.$refs.otherImg.src = require('@/assets/account-fill.svg')
      }
      // update the gender
      this.formData.gender = this.genderSelected
    },
    getFieldRules (key) {
      // disable required fields when we are on the whakapapa
      if (!this.isRegistration) return []

      const label = mapPropToLabel(key)
      if (!label) return []

      const field = this.tribeRequiredDefaultFields.find(field => field.label === label)
      if (!field) return []

      return field.required ? this.rules : []
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
    top: 95%;
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
