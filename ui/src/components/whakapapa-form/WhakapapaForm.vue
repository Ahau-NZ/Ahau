<template>
  <v-form ref="form"  v-model="form.valid" lazy-validation>
    <v-row class="px-2">
      <v-col cols="12" sm="5" order-sm="2">
        <v-row class="pa-0">
          <v-col cols="12" class="pa-0">
            <!-- Avatar -->
            <Avatar
              class="big-avatar"
              size="250px"
              :image="formData.image"
              :alt="formData.name"
              isView
            />
          </v-col>
          <v-col cols="12" justify="center" align="center" class="pa-0">
            <ImagePicker label="Edit whakapapa image"
              @updateAvatar="formData.image = $event"
              isView
            />
          </v-col>
          <!-- END of Avatar -->
        </v-row>
      </v-col>
      <!-- Information Col -->
      <v-col cols="12" sm="7" class="border-right">
        <v-row>
          <!-- Preferred Name -->
          <v-col cols="12" class="pa-1">
            <v-text-field
              v-model="formData.name"
              label="Name*"
              placeholder=" "
              hide-details
              :rules="form.rules.name.whakapapaView"
            />
          </v-col>
          <!-- Description textarea -->
          <v-col cols="12" class="pa-1">
            <v-textarea
              v-model="formData.description"
              label="Description"
              placeholder=" "
              hide-details
              no-resize
              rows="1"
              auto-grow
            ></v-textarea>
          </v-col>
          <v-col cols="12" class="pa-1 pt-10" v-if="!hideDetails">
            Would you like to start with
          </v-col>
          <v-col cols="12" class="pa-1" v-if="!hideDetails">
            <v-radio-group v-model="formData.focus">
              <v-radio :label="`Yourself`" value="self"></v-radio>
              <v-radio :label="`Another person`" value="new"></v-radio>
              <v-radio :label="`Import from CSV file`" value="file"></v-radio>
            </v-radio-group>
          </v-col>
          <v-row v-if="formData.focus == 'file'" transition="scroll-y-transition">
            <v-col cols="1" class="mx-1" >
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" color="blue-grey" medium @click="csvInfo()">mdi-information </v-icon>
                </template>
                <span>Instructions</span>
              </v-tooltip>
            </v-col>
            <v-col cols="6">
              <v-btn color="blue-grey" class="pb-2" @click='downloadCsv()' text >
                <v-icon class="pr-2" color="blue-grey">
                  mdi-file-download
                </v-icon>
                Download CSV Template
              </v-btn>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-file-input
                ref="csvFileInput"
                class="pt-0"
                v-model="file"
                show-size
                accept=".csv"
                label="Upload CSV File"
                :success-messages="successMsg"
                :rules="form.rules.csvFile"
                @click:clear="resetFile()"
              ></v-file-input>
              <!-- :error-messages="errorMsg" -->
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
    <CsvHelperDialog :show="csvHelper" @click="csvInfo()" @close="csvInfo()"/>
    <CsvErrorDialog :show="csvErrorShow" :errorMsg="errorMsg" @click="csvErrorClose()" @close="csvErrorClose()"/>
  </v-form>
</template>
<script>

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import { RULES } from '@/lib/constants'
import CsvHelperDialog from '@/components/dialog/whakapapa/CsvHelperDialog.vue'
import CsvErrorDialog from '@/components/dialog/whakapapa/CsvErrorDialog.vue'
import * as d3 from 'd3'
import validate from '@/lib/validate-csv'

const EMPTY_WHAKAPAPA = {
  name: '',
  description: '',
  mode: 'descendants',
  focus: 'self',
  image: null
}

function setDefaultWhakapapa (whakapapa) {
  return {
    name: whakapapa.name,
    description: whakapapa.description,
    mode: whakapapa.mode,
    focus: whakapapa.focus,
    image: whakapapa.image
  }
}

export default {
  name: 'WhakapapaForm',
  components: {
    Avatar,
    ImagePicker,
    CsvHelperDialog,
    CsvErrorDialog
  },
  props: {
    view: { type: Object, default () { return setDefaultWhakapapa(EMPTY_WHAKAPAPA) } },
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false }
  },
  data () {
    return {
      formData: setDefaultWhakapapa(this.view),
      form: {
        valid: true,
        rules: RULES
      },
      file: null,
      data: null,
      errorMsg: [],
      successMsg: [],
      noErrorsInCSV: true,
      csvHelper: false,
      csvErrorShow: false
    }
  },
  watch: {
    view (newVal) {
      this.formData = newVal
    },
    'formData': {
      handler (newVal) {
        this.$emit('update:view', newVal)
      },
      deep: true
    },
    file (newValue) {
      // this.errorMsg = []
      // this.successMsg = []
      if (newValue != null) { this.checkFile(newValue) }
    },
    data (newValue) {
      if (newValue !== null) {
        var count = 0

        var csv = d3.csvParse(newValue, (d) => {
          count++

          // validate each row (aka d)
          const errorObj = validate.person(d)

          // error detected
          if (errorObj.isError) {
            // push errorMsg
            this.errorMsg.push(errorObj.msg)
            // flag there is error in CSV
            this.noErrorsInCSV = false
            // show error dialog with what the error is
            this.csvError()
          } else {
            return {
              parentNumber: d.parentNumber,
              number: d.number,
              preferredName: d.preferredName,
              legalName: d.legalName,
              gender: d.gender,
              bornAt: d.bornAt.split(/\//).reverse().join('/'),
              diedAt: d.diedAt.split(/\//).reverse().join('/'),
              birthOrder: d.birthOrder,
              phone: d.phone,
              email: d.email,
              address: d.address,
              location: d.location,
              profession: d.profession,
              relationshipType: d.relationshipType ? d.relationshipType : 'birth',
              deceased: d.deceased
            }
          }
        })

        // csv equals count means no errors
        if (count === csv.length) {
          this.noErrorsInCSV = true
        }

        if (this.noErrorsInCSV === false) {
          console.log('CSV had an error')
          // if there is an error clear csv
          csv = ''
        } else {
          this.successMsg = ['Expected result = Top ancestor: ' + csv[0].preferredName + '. First child: ' + csv[1].preferredName]
          if (csv.lenght > 200) {
            this.successMsg.push(['This will take a few moments'])
          }
          if (csv.lenght > 4999) this.successMsg.push(['Ka Rawe! Thats a big whānau'])
          this.$emit('update:data', csv)
        }
      }
    }
  },
  methods: {

    downloadCsv () {
      var csv = 'parentNumber,number,preferredName,legalName,gender,bornAt,deceased,diedAt,birthOrder,relationshipType,profession,phone,email,address,location\n'

      var hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'whakapapa.csv'
      hiddenElement.click()
    },

    csvInfo () {
      this.csvHelper = !this.csvHelper
    },
    csvError () {
      this.csvErrorShow = true
    },
    csvErrorClose () {
      this.resetFile()
      this.csvErrorShow = false
    },

    checkFile (file) {
      if (this.file.name.split('.').pop() !== 'csv') { // check if file extension is csv
        this.errorMsg = ['please upload a CSV file']
      } else {
        var reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
          this.data = reader.result
        }
      }
    },
    resetFile () {
      this.file = null
      this.data = null
      this.errorMsg = []
      this.successMsg = []
    }
  }
}

</script>

<style scoped>
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
</style>
