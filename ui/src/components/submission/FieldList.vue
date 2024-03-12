<template>
  <v-card outlined class="py-1 mx-3">
    <v-checkbox
      v-if="showActions && !isTombstone"
      :label="selectAllCopy ? t('unselectAll') : t('selectAll')"
      v-model="selectAllCopy"
      hide-details
      class="shrink pl-9 my-2"
    >
    </v-checkbox>

    <v-divider v-if="showActions && !isTombstone" light width="50%" class="ml-8"/>

    <v-col v-for="([key, value, customFieldDefn], i) in fields" :key="i" class="py-0">

      <div v-if="customFieldDefn && !isDefaultField(key)">
        <v-checkbox
          v-if="showActions && !isTombstone"
          :value="Boolean(selectedChanges?.customFields?.find(field => field.key === key))"
          hide-details
          color="green"
          class="shrink pl-6 mt-0 black-label"
          @change="addCustomField(key, value, customFieldDefn)"
        >
        <template v-slot:label>
          <span class='field-label'>
            {{ getLabel(key, value, customFieldDefn) }}
          </span>
          {{ getValue(value, customFieldDefn) }}
        </template>
        </v-checkbox>
        <li v-else class="pl-6">
          <span class='field-label'>
            {{ getLabel(key, value, customFieldDefn) }}
          </span>
          {{ getValue(value) }}
        </li>
      </div>

      <!-- avatarImage has a unique structure -->
      <div v-else-if="key == 'avatarImage'">
        <div v-if="sourceProfile[key] == null">
          <v-checkbox
            v-model="selectedChangesCopy[key]"
            hide-details
            :value="value"
            color="green"
            class="shrink pl-6 mt-0 black-label"
          >
            <template v-slot:label>
              <span class="checkbox_label">
                {{ t('addedPicture') }}
              </span>
            </template>
          </v-checkbox>
          <Avatar class="small-avatar" size="80px" :image="changes.avatarImage"/>
        </div>
        <div v-else>
          <v-checkbox
            v-model="selectedChangesCopy[key]"
            hide-details
            :value="value"
            color="green"
            class="shrink pl-6 mt-0 black-label"
          >
            <template v-slot:label>
              <span class="checkbox_label">
                {{ t('changedPicture') }}
              </span>
            </template>
          </v-checkbox>

          <v-col>
            <v-card outlined class="py-1">
              <v-row align="center" class="pt-0">
                <v-col cols="4" align="center">
                  <v-row>
                    <v-col cols="12">
                      <Avatar class="small-avatar" size="80px" :image="sourceProfile.avatarImage"
                        :alt="sourceProfile.preferredName" :gender="sourceProfile.gender"
                        :aliveInterval="sourceProfile.aliveInterval" />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="4" align="center">
                  <v-row>
                    <v-col cols="12" class="pa-0">
                      <v-icon large>mdi-arrow-right-bold</v-icon>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="4" align="center">
                  <v-row>
                    <v-col cols="12">
                      <Avatar class="small-avatar" size="80px" :image="changes.avatarImage"
                        :alt="changes.preferredName" isView />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </div>
      </div>

      <!-- Improving readability of deceased changes -->
      <div v-else-if="key == 'deceased'" class="pl-6">
        <v-checkbox
          v-if="showActions && !isTombstone"
          v-model="selectedChangesCopy[key]"
          :label="t('userDeceased', { value })"
          :value="value"
          hide-details
          color="green"
          class="shrink mt-0 black-label"
        />
        <li v-else>
          {{ t('userDeceased', { value }) }}
        </li>
      </div>

      <!-- Alt names has different structure {add:[],remove:[]} -->
      <div v-else-if="key == 'altNames'">
        <div v-if="value && value.add && value.add.length" class="pl-6">
          <div v-for="(name, i) in [...new Set(value.add)]" :key="name + i">
            <v-checkbox
              v-if="showActions && !isTombstone"
              :value="getAltNameValue('add', name)"
              hide-details
              color="green"
              class="mt-0"
              @change="addAltName('add', name)"
            >
              <template v-slot:label>
                <span class='field-label'>
                  {{ t('altNameChanges.add') }}
                </span>
                {{ name }}
              </template>
            </v-checkbox>
            <li v-else>
              <span class='field-label'>
                {{ t('altNameChanges.add') }}
              </span>
              {{ name }}
            </li>
          </div>
        </div>

        <div v-if="value && value.remove && value.remove.length" class="pl-6">
          <div v-for="(name, i) in value.remove" :key="name + i">
            <v-checkbox
              v-if="showActions && !isTombstone"
              :label="t('altNameChanges.remove', { name })"
              :value="getAltNameValue('remove', name)"
              hide-details
              color="green"
              class="mt-0"
              @change="addAltName('remove', name, i)"
            />
            <li v-else>
              {{ t('altNameChanges.remove', { name }) }}
            </li>
          </div>
        </div>
      </div>

      <div v-else>
        <v-checkbox
          v-if="showActions && !isTombstone"
          :value="Boolean(selectedChangesCopy[key])"
          hide-details
          color="green"
          class="shrink pl-6 mt-0 black-label"
          @change="addSelectedItem(key, value, $event)"
        >
          <template v-slot:label>
            <span class='field-label'>
              {{ getLabel(key, value) }}
            </span>
            {{ getValue(value) }}
          </template>
        </v-checkbox>
        <li v-else class="pl-6">
          <span class='field-label'>
            {{ getLabel(key) }}
          </span>
          {{ getValue(value) }}
        </li>
      </div>
    </v-col>
  </v-card>
</template>

<script>
import { cloneDeep as clone } from 'lodash-es'
import { DEFAULT_PROFILE_MODEL, mapPropToLabel } from '@/lib/custom-field-helpers'

export default {
  name: 'FieldList',
  props: {
    fields: Array,
    changes: Array,
    sourceProfile: Object,
    selectedChanges: Object,
    showActions: Boolean,
    isTombstone: Boolean,
    selectAll: Boolean,
    tribeCustomFields: Array
  },
  data () {
    return {
      selectedChangesCopy: clone(this.selectedChanges), // is this a copy though?
      selectAllCopy: this.selectAll,
      defaultFieldTranslations: {
        preferredName: this.t('preferredName'),
        profession: this.t('profession'),
        address: this.t('address'),
        legalName: this.t('legalName'),
        altNames: this.t('altNames'),
        description: this.t('description'),
        gender: this.t('gender'),
        postCode: this.t('postCode'),
        city: this.t('city'),
        country: this.t('country'),
        aliveInterval: this.t('aliveInterval'),
        birthOrder: this.t('birthOrder'),
        deceased: this.t('deceased'),
        placeOfBirth: this.t('placeOfBirth'),
        placeOfDeath: this.t('placeOfDeath'),
        buriedLocation: this.t('buriedLocation'),
        education: this.t('education'),
        school: this.t('school'),
        email: this.t('email'),
        phone: this.t('phone')
      }
    }
  },
  watch: {
    selectedChangesCopy: {
      deep: true,
      immediate: true,
      handler (changes) {
        this.$emit('update:selectedChanges', changes)
      }
    },
    selectAllCopy: {
      deep: true,
      immediate: true,
      handler (selected) {
        if (selected) {
          // select all fields
          this.selectAllChanges()
        } else {
          // unselect all fields
          this.selectedChangesCopy = {}
        }
      }
    }
  },
  methods: {
    t (key, vars) {
      return this.$t('reviewSubmissionDialog.' + key, vars)
    },
    isDefaultField (key) {
      const label = mapPropToLabel(key)
      return DEFAULT_PROFILE_MODEL.find(field => field.label === label)
    },
    isEmptyValue (value) {
      return (
        value === null ||
        value === '' ||
        (
          Array.isArray(value) &&
          value?.length === 0
        )
      )
    },
    formatArray (values) {
      let string = ''
      for (let i = 0; i < values.length; i++) {
        if (i === values.length - 1) {
          string += values[i]
        } else {
          string += values[i] + ', '
        }
      }
      return string
    },
    formatValue (value) {
      return Array.isArray(value) ? this.formatArray(value) : value
    },
    getLabel (key, value, customFieldDefn) {
      const fieldName = customFieldDefn?.label || this.defaultFieldTranslations[key]
      // NOTE: mix 2024/03/07 because custom field labels may be different in different languages
      // we might get some funny behaviour if an applicant and kaitiaki are running different languages?
      // We may need to review our code for edge cases

      return fieldName
    },
    getValue (value) {
      return this.formatValue(value)
    },
    addSelectedItem (key, value, isChecked) {
      if (isChecked) this.selectedChangesCopy[key] = value
      else delete this.selectedChangesCopy[key]
    },
    addAltName (key, name) {
      if (!this.selectedChangesCopy.altNames) this.selectedChangesCopy.altNames = { add: [], remove: [] }
      const items = this.selectedChangesCopy.altNames[key]
      if (items.includes(name)) items.splice(items.indexOf(name), 1) // remove it
      else items.push(name) // add it

      this.selectedChangesCopy.altNames[key] = items

      this.cleanupAltNames()
    },
    addCustomField (key, value, customFieldDefn) {
      if (!this.selectedChangesCopy.customFields) this.selectedChangesCopy.customFields = []

      const customFields = this.selectedChangesCopy.customFields
      const index = customFields.findIndex(field => field.key === key)
      if (index >= 0) customFields.splice(index, 1)
      else customFields.push({ key, value }) // graphql suggests { key!, value, type }

      this.cleanupCustomFields()
    },
    cleanupAltNames () {
      if (
        this.selectedChangesCopy?.altNames?.add?.length === 0 &&
        this.selectedChangesCopy?.altNames?.remove?.length === 0
      ) delete this.selectedChangesCopy.altNames
    },
    cleanupCustomFields () {
      if (this.selectedChangesCopy?.customFields?.length === 0) {
        delete this.selectedChangesCopy.customFields
      }
    },
    getAltNameValue (key, name) {
      const altNameChanges = this.selectedChangesCopy?.altNames
      if (!altNameChanges || !altNameChanges[key]) return false

      return altNameChanges[key]
        .find(altName => altName === name)
    },
    selectAllChanges () {
      this.selectedChangesCopy = {}

      this.changes.forEach(([key, value, customFieldDefn]) => {
        if (key === 'altNames') {
          let { add = [], remove = [] } = (value || {})
          add = [...new Set(add)]
          remove = [...new Set(remove)]
          add.forEach(name => this.addAltName('add', name))
          remove.forEach(name => this.addAltName('remove', name))
        } // eslint-disable-line
        else if (customFieldDefn && !this.isDefaultField(key)) {
          this.addCustomField(key, value, customFieldDefn)
        } // eslint-disable-line
        else {
          this.addSelectedItem(key, value, true)
        }
      })
    }
  }
}
</script>

<style scoped lang='scss'>
.field-label {
  font-weight: 500;
  min-width: 160px;
  margin-right: 10px;
}
</style>
