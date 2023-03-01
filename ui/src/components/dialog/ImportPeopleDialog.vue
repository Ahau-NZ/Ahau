<template>
  <div>
    <Dialog :show="show" title="Import people to tribal database" width="720px" :goBack="close" enableMenu
      @submit="submit"
      @close="close"
    >
      <template v-slot:content>
        <v-row transition="scroll-y-transition">
          <v-col cols="6">
            <v-btn color="blue-grey" class="pb-2" @click='download()' text >
              <v-icon class="pr-2" color="blue-grey">
                mdi-file-download
              </v-icon>
              Download CSV Template
            </v-btn>
          </v-col>
          <v-col cols="10" class="py-0 ml-4">
            <v-file-input
              ref="csvFileInput"
              class="pt-0"
              v-model="file"
              show-size
              accept=".csv"
              :label="t('csvUpload')"
              :success-messages="successMsg"
              :rules="form.rules.csvFile"
              @click:clear="resetFile()"
            ></v-file-input>
          </v-col>
          <v-col v-if="showAdditionalColumns" cols="12" class="pa-7">
            <span>
              Warning: you are importing a csv which contains columns that are either:<br/>
              <li>already custom fields on this tribe <strong>OR</strong></li>
              <li>not yet custom fields on this tribe</li>
              <br/>
              Please make sure all columns listed below have a type.<br/>
              You cannot edit the type on columns that are already custom fields on this tribe.<br/>
              If you wish to exclude a column from the import, press delete and it will not be included. <br/>
            </span>
            <v-data-table
              :headers="headers"
              :items="additionalColumns"
              item-key="label"
            >
              <template v-slot:item.type="{ item }">
                <v-select
                  v-model="additionalColumns[item.index].type"
                  :items="typeOptions"
                  class="custom-select"
                  v-bind="customProps"
                  required
                  :disabled="item.disabled || item.isExisting"
                ></v-select>
              </template>
              <template v-slot:item.visibleBy="{ item }">
                <v-select
                  v-model="additionalColumns[item.index].visibleBy"
                  :items="visibleByOptions"
                  class="custom-select"
                  v-bind="customProps"
                ></v-select>
              </template>
              <template v-slot:item.required="{ item }">
                <v-checkbox
                  v-model="additionalColumns[item.index].required"
                  :disabled="item.disabled || item.isExisting"
                ></v-checkbox>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-icon medium class="mx-2" @click.stop="toggleField(item)">
                  {{ item.disabled ? 'mdi-undo' : 'mdi-delete' }}
                </v-icon>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </template>
    </Dialog>
    <CsvErrorDialog v-if="csvErrorShow" :show="csvErrorShow" :errorMsgs="errorMsgs" type="people" @click="csvErrorClose()" @close="csvErrorClose()"/>
  </div>
</template>

<script>
import get from 'lodash.get'
import pick from 'lodash.pick'

import pileSort from 'pile-sort'

import { mapActions, mapGetters, mapMutations } from 'vuex'
import { RULES } from '@/lib/constants'
import CsvErrorDialog from '@/components/dialog/whakapapa/CsvErrorDialog.vue'
import { importCsv, downloadCsv, parseCustomFieldValue } from '@/lib/csv'

import Dialog from '@/components/dialog/Dialog.vue'
// import AccessButton from '@/components/button/AccessButton.vue'

// const SINGLE_LIST = 'singleList'
// const MULTI_LIST = 'multiList'

export default {
  name: 'ImportPeopleDialog',
  props: {
    title: String,
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      timestampOffset: 0,
      form: {
        valid: true,
        rules: RULES
      },
      file: null,
      errorMsgs: [],
      successMsg: [],
      noErrorsInCSV: true,
      csvErrorShow: false,
      csv: '',
      additionalColumns: [],
      showAdditionalColumns: false,
      headers: [
        {
          value: 'label',
          text: 'Label',
          align: 'center'
        },
        {
          value: 'type',
          text: 'Type'
        },
        {
          value: 'visibleBy',
          text: 'Visible By'
        },
        {
          value: 'required',
          text: 'Required'
        },
        {
          value: 'actions'
        }
      ],
      visibleByOptions: [
        { text: 'kaitiaki only', value: 'admin' },
        { text: 'all members', value: 'members' }
      ],
      typeOptions: [
        { text: 'text', type: 'text' },
        { text: 'number', type: 'number' },
        { text: 'date', type: 'date' },
        { text: 'checkbox', type: 'checkbox' },
        { text: 'multiple entries', value: 'array' }
        // TODO: not supporting list types right now as it would require going back over the data
        // and validating against the options given
        // { text: 'list (choose single entry)', value: SINGLE_LIST, type: 'list', multiple: false },
        // { text: 'list (choose multiple entries) ', value: MULTI_LIST, type: 'list', multiple: true },
      ]
    }
  },
  mounted () {
    this.setAllowSubmissions(false)
  },
  watch: {
    file (newFile) {
      if (newFile == null) return

      this.errorMsgs = []
      this.successMsg = []

      importCsv(newFile, 'people')
        .then(csv => {
          this.csv = csv
          this.successMsg = (csv.length > 1)
            ? [
                `Expected result = first person: ${csv[0].profile.preferredName}.
                Second person: ${csv[1].profile.preferredName}`
              ]
            : [`Expected result = first person: ${csv[0].profile.preferredName}.`]

          if (get(this.csv, 'additionalColumns.length')) {
            this.additionalColumns = this.getAdditionalColumns()
            this.showAdditionalColumns = true
          }
        })
        .catch(errs => {
          this.errorMsgs = errs
          if (this.errorMsgs.length) this.csvErrorShow = true
        })
    },
    canBeImported: {
      deep: true,
      handler (val) {
        this.setAllowSubmissions(val)
      }
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('tribe', ['accessOptions', 'tribeCustomFields']),
    canBeImported () {
      if (!this.showAdditionalColumns || !get(this.additionalColumns, 'length')) return true

      return this.additionalColumns
        .filter(column => !column.disabled)
        .every(column => column.type !== null)
    },
    customProps () {
      return {
        hideDetails: true,
        menuProps: { bottom: true, offsetY: true, light: true },
        light: true,
        autoFocus: true
      }
    }
  },
  methods: {
    ...mapMutations(['setAllowSubmissions']),
    ...mapActions(['setLoading', 'setCurrentAccess']),
    getAdditionalColumns () {
      return this.csv.additionalColumns.map((column, index) => {
        const fieldDef = this.tribeCustomFields.find(field => field.label === column)

        if (fieldDef) {
          return {
            ...fieldDef,
            index,
            disabled: false,
            isExisting: true
          }
        }

        return {
          index,
          label: column,
          type: null,
          required: false,
          visibleBy: 'members',
          disabled: false
        }
      })
    },
    toggleField (item) {
      this.additionalColumns[item.index].disabled = !this.additionalColumns[item.index].disabled
    },
    close () {
      this.csv = ''
      this.$emit('close')
    },
    download () {
      downloadCsv('people')
    },
    csvErrorClose () {
      this.resetFile()
      this.csvErrorShow = false
    },
    resetFile () {
      this.file = null
      this.errorMsgs = []
      this.successMsg = []
    },
    submit () {
      let [removedCustomFields, oldCustomFieldDefs, customFieldDefs] = pileSort(
        this.additionalColumns, [
          (col) => col.disabled, // removedCustomFields
          (col) => !col.disabled && col.isExisting // oldCustomFieldDefs
          // (col) => !col.disabled && !col.isExisting // newCustomFields
        ]
      )

      // populate new custom fields with a key
      // then save new custom fields to the community
      customFieldDefs = customFieldDefs.map(customField => {
        return {
          key: this.generateTimestamp(),
          ...pick(customField, ['type', 'required', 'label', 'visibleBy'])
        }
      })

      oldCustomFieldDefs = oldCustomFieldDefs.map(customField => {
        return pick(customField, ['type', 'required', 'label', 'visibleBy', 'key'])
      })

      const allCustomFieldDefs = [...oldCustomFieldDefs, ...customFieldDefs]

      const csvRows = this.csv.map(csvRow => {
        const customFields = get(csvRow, 'profile.customFields')

        if (customFields) {
          csvRow.profile.customFields = Object.entries(customFields)
            .map(([label, value]) => {
              // check if the field is an excluded/removed one
              if (removedCustomFields.find(fieldDef => fieldDef.label === label)) return null

              // find the field definition with the same label as
              // the custom field on the profile
              const customFieldDef = allCustomFieldDefs
                .find(fieldDef => fieldDef.label === label)

              if (!customFieldDef) return null

              value = parseCustomFieldValue(customFieldDef, value)

              // get rid of any custom fields that are null
              // no point in saving null
              if (value === null) return null

              return { key: customFieldDef.key, value }
            })
            .filter(Boolean) // get rid of any we couldnt find a definition for, for some reason?
        }

        return csvRow
      })

      this.setLoading(true)
      this.$emit('submit', { csvRows, customFieldDefs })
      this.close()
    },
    t (key, vars) {
      return this.$t('importPeopleForm.' + key, vars)
    },
    generateTimestamp () {
      return (Date.now() + (this.timestampOffset += 10)).toString()
    }
  },
  components: {
    Dialog,
    // AccessButton,
    CsvErrorDialog
  }
}
</script>

<style scoped lang="scss">

.custom-select ::v-deep .v-select__selections input {
    display: none;
}
.custom-select ::v-deep .v-text-field {
    padding-top: 0px;
    margin-top: 0px;
}
</style>
