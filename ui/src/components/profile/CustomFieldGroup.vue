<template>
  <v-row class="mx-0">
    <v-col cols="12" class="overline">
      {{ tribe.preferredName }}
    </v-col>
    <v-col v-for="(fieldDef, i) in customFieldDefs" :key="`cf-${fieldDef.key}-${i}`" :cols="calculateFieldCols(fieldDef)" class="py-2">
      <CustomField
        :fieldDef="fieldDef"
        :fieldValue.sync="customFieldValues[fieldDef.key]"
        :readonly="readonly"
        :sideView="sideView"
        :isRegistration="isRegistration"
      />
    </v-col>
  </v-row>
</template>

<script>
import get from 'lodash.get'
import isEmpty from 'lodash.isempty'

import Vue from 'vue'
import CustomField from './CustomField.vue'

import { getDefaultFieldValue } from '@/lib/custom-field-helpers.js'

export default {
  name: 'CustomFieldGroup',
  props: {
    tribe: Object,
    readonly: Boolean,
    sideView: Boolean,
    isRegistration: Boolean,
    fieldValues: {
      type: Object,
      default: () => {}
    },
    profile: Object
  },
  components: {
    CustomField
  },
  data () {
    return {
      customFieldValues: {},
      currentProfile: null
    }
  },
  watch: {
    customFieldValues: {
      deep: true,
      immediate: true,
      handler (val) {
        this.$emit('update:fieldValues', val)
      }
    }
  },
  mounted () {
    this.populateCustomFieldValues()
  },
  computed: {
    customFieldDefs () {
      return this.tribe.customFields
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    smScreen () {
      return this.mobile || this.sideView
    },
    sideViewCols () {
      return this.smScreen ? '12' : '6'
    },
    customFieldValuesFromProfile () {
      if (!this.profile?.customFields) return []

      return (Array.isArray(this.profile?.customFields))
        ? this.profile?.customFields
        : Object.entries(this.profile.customFields).map(([key, value]) => ({ key, value }))
    },
    adminCustomFieldValues () {
      if (!this.profile?.adminProfile?.customFields) return []

      return Array.isArray(this.profile.adminProfile.customFields)
        ? this.profile.adminProfile.customFields
        : Object.entries(this.profile.adminProfile).map(([key, value]) => ({ key, value }))
    }
  },
  methods: {
    populateCustomFieldValues () {
      // look in the store for the custom fields???
      // find the profile in the tribe?
      this.customFieldDefs.forEach(fieldDef => {
        Vue.set(this.customFieldValues, fieldDef.key, this.getFieldValue(fieldDef))
      })
    },
    getFieldValue (fieldDef) {
      // handle if there isnt a profile, e.g. editing your profile for registration
      if (!this.profile) {
        // incase we are registering and have opened then closed
        // the editing form, this preserves those values
        const fieldValue = get(this.fieldValues, fieldDef.key)
        if (fieldValue !== undefined) return fieldValue

        return getDefaultFieldValue(fieldDef)
      }

      // TODO: cherese 23/02/23
      // NOTE: i dont like this monkey patching, but there is a lot of logic here around profiles and how they are loading,
      // that it is going to take longer if i take that route
      // The problem i have here is that initially the custom fields are an array
      // but for some reason, after a reload (like when saving changes to the profile)
      // the customFields then become an object. So here i am monkey patching to turn it
      // back into an array
      const findThisField = field => field.key === fieldDef.key
      // find the value from the applicants profile (if there is one)

      // first we look if the field is on the adminProfile
      let field = this.adminCustomFieldValues.find(findThisField)
      const fallbackField = this.customFieldValuesFromProfile.find(findThisField)

      if (!field) field = fallbackField
      if (isEmpty(field?.value) && !isEmpty(fallbackField?.value)) field = fallbackField
      if (!field) field = { value: getDefaultFieldValue(fieldDef) }

      // otherwise figure out a default value
      return field.value
    },
    calculateFieldCols (field) {
      if (field.type === 'array') return '12'
      return this.sideViewCols
    }
  }
}
</script>
