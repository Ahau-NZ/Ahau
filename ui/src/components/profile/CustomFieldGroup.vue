<template>
  <v-row>
    <v-col cols="12">
      {{ tribe.preferredName }}
    </v-col>
    <v-col v-for="(customField, i) in customFields" :key="`cf-${customField.key}-${i}`" :cols="calculateFieldCols(customField)" class="py-2">
      <CustomField
        :field="customField"
        :fieldValue.sync="customFieldValues[customField.key]"
        :readonly="readonly"
        :sideView="sideView"
        :isRegistration="isRegistration"
      />
    </v-col>
  </v-row>
</template>

<script>
import get from 'lodash.get'

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
      handler (val) {
        this.$emit('update:fieldValues', val)
      }
    }
  },
  mounted () {
    this.populateCustomFieldValues()
  },
  computed: {
    customFields () {
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
    }
  },
  methods: {
    populateCustomFieldValues () {
      // look in the store for the custom fields???
      // find the profile in the tribe?
      this.customFields.forEach(field => {
        Vue.set(this.customFieldValues, field.key, this.getFieldValue(field))
      })
    },
    getFieldValue (field) {
      // handle if there isnt a profile, e.g. editing your profile for registration
      if (!this.profile) {
        // incase we are registering and have opened then closed
        // the editing form, this preserves those values
        const fieldValue = get(this.fieldValues, field.key)
        if (fieldValue !== undefined) return fieldValue

        return getDefaultFieldValue(field)
      }

      const valueOnProfile = this.profile.customFields.find(customField => customField.key === field.key)
      if (valueOnProfile !== undefined) return valueOnProfile.value

      // otherwise figure out a default value
      return getDefaultFieldValue(field)
    },
    calculateFieldCols (field) {
      if (field.type === 'array') return '12'
      return this.sideViewCols
    }
  }
}
</script>
