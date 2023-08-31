<template>
  <v-card outlined class="py-1 mx-3">
    <v-checkbox
      v-if="showActions && !isTombstone"
      hide-details
      v-model="selectAllCopy"
      class="shrink pl-9 my-2"
      :label="selectAllCopy ? t('unselectAll') : t('selectAll')"
    >
    </v-checkbox>
    <v-divider v-if="showActions && !isTombstone" light width="50%" class="ml-8"/>
    <v-col v-for="([key, value], i) in fields" :key="i" class="py-0">
      <!-- avatarImage has a unique structure -->
      <div v-if="key == 'avatarImage'">
        <div v-if="sourceProfile[key] == null">
          <v-checkbox hide-details v-model="selectedChangesCopy[key]" :value="value" color="green"
            class="shrink pl-6 mt-0 black-label">
            <template v-slot:label>
              <span class="checkbox_label">
                {{ t('addedPicture') }}
              </span>
            </template>
          </v-checkbox>
          <Avatar class="small-avatar" size="80px" :image="changes.avatarImage"/>
        </div>
        <div v-else>
          <v-checkbox hide-details v-model="selectedChangesCopy[key]" :value="value" color="green"
            class="shrink pl-6 mt-0 black-label">
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
          :value="value"
          :label="t('userDeceased', { value })"
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
          <div v-for="name in value.add" :key="name">
            <v-checkbox
              v-if="showActions && !isTombstone"
              :label="t('altNameChanges.add', { name })"
              hide-details
              color="green"
              class="mt-0"
              @change="addAltName('add', name)"
              :value="getAltNameValue('add', name)"
            />
            <li v-else>
              {{ t('altNameChanges.add', { name }) }}
            </li>
          </div>
        </div>

        <div v-if="value && value.remove && value.remove.length" class="pl-6">
          <div v-for="name in value.remove" :key="name">
            <v-checkbox
              v-if="showActions && !isTombstone"
              :label="t('altNameChanges.remove', { name })"
              hide-details
              color="green"
              class="mt-0"
              @change="addAltName('remove', name)"
              :value="getAltNameValue('remove', name)"
            />
            <li v-else>
              {{ t('altNameChanges.remove', { name }) }}
            </li>
          </div>
        </div>
      </div>

      <div v-else-if="key === 'customFields'">
        <div v-for="field in value" :key="field.key">
          <v-checkbox
            v-if="showActions && !isTombstone"
            :label="getCustomFieldLabel(field.key, field.value)"
            hide-details
            color="green"
            class="shrink pl-6 mt-0 black-label"
            @change="addCustomField(field)"
            :value="getCustomFieldValue(field)"
          />
          <li v-else class="pl-6">
            {{ getCustomFieldLabel(field.key, field.value) }}
          </li>
        </div>
      </div>

      <div v-else>
        <v-checkbox
          v-if="showActions && !isTombstone"
          :label="getLabel(key, value)"
          @change="addSelectedItem(key, value, $event)"
          :value="Boolean(selectedChangesCopy[key])"
          hide-details
          color="green"
          class="shrink pl-6 mt-0 black-label"
        />
        <li v-else class="pl-6">
          {{ getLabel(key, value) }}
        </li>
      </div>
    </v-col>
  </v-card>
</template>

<script>
export default {
  name: 'FieldList',
  props: {
    fields: Array,
    sourceProfile: Object,
    selectedChanges: Object,
    changes: Array,
    showActions: Boolean,
    isTombstone: Boolean,
    selectAll: Boolean,
    tribeCustomFields: Array
  },
  data () {
    return {
      selectedChangesCopy: this.selectedChanges,
      selectAllCopy: this.selectAll,
      updatedKeys: {
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
    getLabel (key, value) {
      return this.isEmptyValue(this.sourceProfile[key])
        ? this.t('newField', { fieldName: this.updatedKeys[key], fieldValue: this.formatValue(value) })
        : this.getChangesLabel(key, value)
    },
    // NOTE: cherese 1/05/23
    // I removed the "from" text from here, change from ... to, because when the sourceProfile is updated, it shows
    // the updated values, so there isnt an "easy" way to show the old values
    getChangesLabel (key, value) {
      const fieldName = this.updatedKeys[key]
      const fieldValue = this.formatValue(value)
      return this.t('newField', { fieldName, fieldValue })
    },
    getCustomFieldLabel (key, value) {
      const fieldDef = this.tribeCustomFields.find(field => field.key === key)
      if (!fieldDef) {
        console.error('getCustomFieldLabel failed', { key, value, tribeCustomFields: this.tribeCustomFields })
      }
      const fieldName = fieldDef?.label || 'custom field?'
      return this.t('newField', { fieldName, fieldValue: this.formatValue(value) })
    },
    getCustomFieldValue (field) {
      const customFieldChanges = this.selectedChangesCopy?.customFields
      if (!customFieldChanges) return false

      return customFieldChanges.find(customField => customField.key === field.key)
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
    cleanupAltNames () {
      if (this.selectedChangesCopy.altNames.add.length === 0 && this.selectedChangesCopy.altNames.remove.length === 0) delete this.selectedChangesCopy.altNames
    },
    cleanupCustomFields () {
      if (this.selectedChangesCopy?.customFields?.length === 0) delete this.selectedChangesCopy.customFields
    },
    addCustomField (customField) {
      if (!this.selectedChangesCopy.customFields) this.selectedChangesCopy.customFields = []

      const items = this.selectedChangesCopy.customFields
      const field = items.find(field => field.key === customField.key)
      if (field) items.splice(items.indexOf(field), 1)
      else {
        delete customField.__typename
        items.push(customField)
      }
      this.cleanupCustomFields()
    },
    getAltNameValue (key, name) {
      const altNameChanges = this.selectedChangesCopy?.altNames
      if (!altNameChanges || !altNameChanges[key]) return false

      return altNameChanges[key]
        .find(altName => altName === name)
    },
    selectAllChanges () {
      this.selectedChangesCopy = {}
      this.changes.forEach(([key, value]) => {
        if (key === 'altNames') {
          const { add = [], remove = [] } = (value || {})
          add.forEach(name => this.addAltName('add', name))
          remove.forEach(name => this.addAltName('remove', name))
        } else if (key === 'customFields') {
          (value || []).forEach(field => {
            this.addCustomField(field)
          })
        } else {
          this.addSelectedItem(key, value, true)
        }
      })
    }
  }
}
</script>
