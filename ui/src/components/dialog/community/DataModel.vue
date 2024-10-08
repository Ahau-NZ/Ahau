<template>
  <div class="ma-2 mt-4">
    <div class="pl-4">
      <p class="overline black--text">{{ t('dataModel') }}</p>
      <p class="black--text">{{ t('dataModelInstructions') }}</p>
    </div>
    <!-- profile data table -->
    <v-data-table
      :headers="headers"
      :items="filteredFields"
      class="elevation-1"
      disable-sort
      disable-pagination
      hide-default-footer
      show-expand
      :expanded="expandedFields"
      item-key="label"
    >
      <template v-slot:item.order="{ item }">
        <v-select
          :items="item.order ? ordersForOrdered : ordersForUnordered"
          :value="determineOrder(item)"
          @change="changeOrder(item, $event)"
          :disabled="item.type === 'image'"
        ></v-select>
      </template>

      <!-- TODO: this is disabled for now as we do not implement this yet -->
      <template v-slot:item.visibleBy="{ item }"> <!-- eslint-disable-line -->
        <v-select
          v-model="item.visibleBy"
          :items="items"
          single-line
          class="custom-select"
          v-bind="customProps"
          :disabled="isDisabledField(item)"
        ></v-select>
      </template>
      <template v-slot:item.required="{ item }"> <!-- eslint-disable-line -->
        <v-checkbox
          v-if="!isRequiredDisabled(item)"
          v-model="item.required"
          @click="updateRequiredField(item)"
          :disabled="isDisabledField(item)"
        ></v-checkbox>
      </template>
      <template v-slot:item.delete="{ item }"> <!-- eslint-disable-line -->
        <v-icon
          @click="showDeleteFieldDialog(item)"
          :disabled="isDisabledField(item)"
        >mdi-delete</v-icon>
      </template>

      <template v-slot:item.data-table-expand="{ item, isExpanded, expand }">
        <v-icon
          v-if="item.type === 'list'"
          :class="{
            'v-data-table__expand-icon': true,
            'v-data-table__expand-icon--active': isExpanded
          }"
          @click.stop="expand(!isExpanded)"
          >$expand</v-icon
        >
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-text-field
            class="mx-2 mt-2"
            label="list options"
            disabled
            :value="item.options"
          />
        </td>
      </template>
    </v-data-table>
    <!-- add new button -->
    <v-col cols="12" justify="start" class="px-1">
      <v-btn color="#3b3b3b" class="white--text" @click="newFieldDialog = true">
        <v-icon class="pr-1">mdi-plus</v-icon> {{ t('addProfileField') }}
      </v-btn>
    </v-col>
    <!-- add new field dialog -->
    <v-dialog
        v-if="newFieldDialog"
        v-model="newFieldDialog"
        max-width="500px"
        light
      >
        <v-card>
          <v-card-title>
            <span class="dialog-title">{{ t('newFieldDialogTitle') }}</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="newField.label"
                    :label="t('label')"
                    :rules="rules"
                    v-bind="customProps"
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-select
                    :label="t('inputType')"
                    :value="newField.text"
                    :items="typeOptions"
                    class="custom-select"
                    @input="updateNewFieldByType"
                    v-bind="customProps"
                  ></v-select>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-select
                    :label="t('visibleBy')"
                    v-model="newField.visibleBy"
                    :items="items"
                    class="custom-select"
                    v-bind="customProps"
                  ></v-select>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-checkbox
                    :label="t('required')"
                    v-model="newField.required"
                  ></v-checkbox>
                </v-col>
                <v-col
                  cols="12"
                  v-if="newField.type === 'list'"
                >
                  <v-text-field
                    v-model="newField.options"
                    label="List options"
                    placeholder="Comma separated e.g. Yellow,Orange,Red,Blue"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="closeNewFieldDialog"
              text
              :large="!mobile"
              class="secondary--text"
            >
              {{ $t('dialog.cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              :large="!mobile"
              @click="addCustomField"
              :disabled="!newField.label"
            >
              {{ $t('dialog.save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
    </v-dialog>
    <!-- delete field dialog -->
    <v-dialog v-model="deleteFieldDialog" light max-width="500px">
      <v-card>
        <p class="pa-5">Are you sure you want to delete this field from profiles?</p>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-2" text @click="deleteFieldDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="deleteField">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </div>
</template>
<script>

import { cloneDeep as clone } from 'lodash-es'
import { getCustomFields, getDefaultFields, REQUIRED_DISABLED_FIELDS, DISABLED_DEFAULT_FIELDS } from '@/lib/custom-field-helpers'

const buildNewField = () => ({
  label: '',
  type: 'text',
  required: false,
  visibleBy: 'members'
})

const SINGLE_LIST = 'singleList'
const MULTI_LIST = 'multiList'

export default {
  name: 'DataModel',
  props: {
    customFields: Array
  },
  data () {
    return {
      newFieldDialog: false,
      deleteFieldDialog: false,
      headers: [
        { text: this.t('order'), value: 'order', width: '50px' }, // TODO: translate
        { text: this.t('data'), value: 'label' },
        { text: this.t('type'), value: 'type' },
        { text: this.t('access'), value: 'visibleBy' },
        { text: this.t('required'), value: 'required', width: '50px' },
        { text: this.t('deleteField'), value: 'delete', width: '50px' }
      ],
      items: [
        { text: this.t('kaitiakiOnly'), value: 'admin' },
        { text: this.t('allMembers'), value: 'members' }
      ],
      typeOptions: [
        { text: this.t('text'), type: 'text' },
        { text: this.t('number'), type: 'number' },
        { text: this.t('date'), type: 'date' },
        { text: this.t('checkbox'), type: 'checkbox' },
        { text: this.t('list.single'), value: SINGLE_LIST, type: 'list', multiple: false },
        { text: this.t('list.multiple'), value: MULTI_LIST, type: 'list', multiple: true },
        { text: this.t('multiple'), value: 'array' }
      ],
      rules: [value => !!value || 'Required.'],
      currentField: {},
      newField: buildNewField()
    }
  },
  mounted () {
    window.scrollTo(0, 0)
  },
  computed: {
    fieldsWithOrders () {
      return this.allFields
        .filter(field => !field.tombstone && field.order !== null)
        .sort((a, b) => a.order - b.order)
    },

    // Computed property for fields without orders
    fieldsWithoutOrders () {
      return this.allFields
        .filter(field => !field.tombstone && field.order === null)
    },

    // Computed property to combine the two lists
    filteredFields () {
      return [
        ...this.fieldsWithOrders,
        ...this.fieldsWithoutOrders
      ]
    },
    allFields () {
      return [...this.defaultFields, ...this.customDataFields]
    },
    defaultFields () {
      return getDefaultFields(this.customFields)
    },
    customDefaultFields () {
      return this.defaultFields.filter(field => field.key)
    },
    customDataFields () {
      return getCustomFields(this.customFields)
    },
    expandedFields () {
      return this.allFields.filter(field => field.type === 'list')
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    customProps () {
      return {
        hideDetails: true,
        menuProps: { bottom: true, offsetY: true, light: true },
        light: true,
        autoFocus: true
      }
    },

    maxOrder () {
      return this.fieldsWithOrders.length + (this.fieldsWithoutOrders.length ? 1 : 0)
    },

    // Generate order numbers up to the length of fieldsWithOrders
    ordersForOrdered () {
      return Array.from({ length: this.fieldsWithOrders.length }, (_, i) => i + 1)
    },

    // Generate order numbers up to maxOrder, which includes one extra slot for new unordered fields
    ordersForUnordered () {
      return Array.from({ length: this.maxOrder }, (_, i) => i + 1)
    }
  },
  methods: {
    // (Based on https://softwareengineering.stackexchange.com/a/195317/54663)
    // (Taken from https://github.com/cobudget/cobudget/blob/20e2c6ad20c94c9f621c1323b119880db7c70205/ui/components/RoundSettings/DraggableItems.js#L41)
    changeOrder (item, newIndex) {
      // 1. Determine the "newOrder" of the item, based on the desired newIndex
      newIndex = newIndex - 1

      const localItems = this.filteredFields
      const oldIndex = localItems.indexOf(item)

      let beforeOrder, afterOrder
      let beforeItem

      const afterItem = localItems[newIndex]

      // If afterItem has no order, temporarily use its index as the order
      if (!afterItem || afterItem.order === null) {
        afterOrder = newIndex
      } else {
        afterOrder = afterItem.order
      }

      if (oldIndex > newIndex) {
        beforeItem = localItems[newIndex - 1]
      } else {
        beforeItem = localItems[newIndex + 1]
      }

      // If beforeItem has no order, temporarily use its index as the order
      if (!beforeItem || beforeItem.order === null) {
        beforeOrder = beforeItem ? (newIndex + (oldIndex > newIndex ? -1 : 1)) : afterOrder + 1
      } else {
        beforeOrder = beforeItem.order
      }

      if (newIndex === 0) {
        // First element
        afterOrder = afterItem ? (afterItem.order || 0) : 0
        beforeOrder = afterOrder - 1
      }

      const newOrder = (beforeOrder - afterOrder) / 2.0 + afterOrder

      // 2. Determine what this means for customFields
      const newCustomFields = clone(this.customFields)
      const isMatch = (field) => field.label === item.label

      // If it's an existing customField, mutate it
      const index = newCustomFields.findIndex(isMatch)
      const existingField = newCustomFields[index]
      if (existingField) {
        newCustomFields[index] = {
          ...clone(item),
          order: newOrder
        }
      } else {
        // Otherwise, check if it's an existing defaultField we want to use as a template
        const existingDefaultField = this.defaultFields.find(isMatch)
        if (!existingDefaultField) {
          console.error('Cannot change order as could not find field of', item)
          return
        }

        newCustomFields.push({
          key: this.generateTimestamp(),
          ...clone(existingDefaultField),
          order: newOrder
        })
      }

      this.$emit('update:customFields', newCustomFields)
      // This triggers a change:
      // customFields => defaultFields + customDataFields => allFields => filteredFields
    },

    determineOrder (item) {
      // dont show an order for fields that dont have one - this is to save confusion in the ui
      if (!item.order) return

      // NOTE: the order shown and the order saved to the items are not the same
      return this.filteredFields.indexOf(item) + 1
    },
    isDisabledField (field) {
      return DISABLED_DEFAULT_FIELDS.includes(field.label)
    },
    isRequiredDisabled (field) {
      return REQUIRED_DISABLED_FIELDS.includes(field.label)
    },
    updateRequiredField (selectedField) {
      const newCustomFields = clone(this.customFields)
      const isMatch = (field) => field.label === selectedField.label

      // if is existing customField, mutate that
      const index = newCustomFields.findIndex(isMatch)
      const existingField = newCustomFields[index]
      if (existingField) {
        newCustomFields[index].required = selectedField.required
      } // eslint-disable-line
      else {
        // otherwise, check if it's an existing defaultField we want to use as a template
        // (or revert to empty)
        const existingField = this.defaultFields.find(isMatch) || {}

        newCustomFields.push({
          key: this.generateTimestamp(),
          ...clone(existingField),
          required: selectedField.required
        })
      }

      this.$emit('update:customFields', newCustomFields)
    },
    updateNewFieldByType (type) {
      switch (type) {
        case SINGLE_LIST:
          this.newField.type = 'list'
          this.newField.multiple = false
          this.newField.options = []
          break
        case MULTI_LIST:
          this.newField.type = 'list'
          this.newField.multiple = true
          this.newField.options = []
          break
        default:
          this.newField.type = type
      }
    },
    closeNewFieldDialog () {
      this.newField = buildNewField()
      this.newFieldDialog = false
    },
    addCustomField () {
      const newCustomFields = clone(this.customFields)
      const isMatch = (field) => field.label === this.newField.label

      // if is existing customField, mutate that
      const index = newCustomFields.findIndex(isMatch)
      const existingField = newCustomFields[index]
      if (existingField) {
        newCustomFields[index] = {
          ...existingField, // already a clone
          ...clone(this.newField),
          tombstone: null
        }
      } // eslint-disable-line
      else {
        // otherwise, check if it's an existing defaultField we want to use as a template
        // (or revert to empty)
        const existingField = this.defaultFields.find(isMatch) || {}

        newCustomFields.push({
          key: this.generateTimestamp(),
          ...clone(existingField),
          ...clone(this.newField)
        })
      }

      this.$emit('update:customFields', newCustomFields)
      this.closeNewFieldDialog()
    },
    deleteField () {
      // mutate the customFields
      const newCustomFields = clone(this.customFields)

      // if is existing customField, mutate that
      const index = this.customFields.findIndex(field => field.label === this.currentField.label)
      const existingField = newCustomFields[index]
      if (existingField) {
        // if it's already in customFields, away we go!
        newCustomFields[index] = {
          ...existingField, // already a clone
          tombstone: {
            date: Date.now()
          }
        }
      } // eslint-disable-line
      else {
        // if it's not, that means it's probably a defaultField,
        // so we need to make key for it, and add it to customFields
        newCustomFields.push({
          key: this.generateTimestamp(),
          ...clone(this.currentField),
          tombstone: {
            date: Date.now()
          }
        })
      }

      this.$emit('update:customFields', newCustomFields)
      this.deleteFieldDialog = false
    },
    t (key, vars) {
      return this.$t('addCommunityForm.' + key, vars)
    },
    showDeleteFieldDialog (field) {
      this.currentField = field
      this.deleteFieldDialog = true
    },

    generateTimestamp () {
      return Date.now().toString()
    }
  }
}

</script>
<style scoped>
.custom-select ::v-deep .v-select__selections input {
    display: none;
}
.custom-select ::v-deep .v-text-field {
    padding-top: 0px;
    margin-top: 0px;
}
.dialog-title {
  font: 'Roboto';
  font-weight: 400;
  font-size: 0.99rem;
  letter-spacing: 0.1666666667em;
  text-transform: uppercase;
}
</style>
