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
              <v-radio :label="`Build from file`" value="file"></v-radio>
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
                whakapapa-template.csv
              </v-btn>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-file-input
              class="pt-0"
              v-model="file"
              show-size
              accept=".csv"
              label="CSV file input"
              :success-messages="successMsg"
              :error-messages="errorMsg"
              @click:clear="resetFile()"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
    <CsvHelperDialog :show="this.csvHelper" @click="csvInfo()" @close="csvInfo()"/>
  </v-form>
</template>
<script>

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import { RULES } from '@/lib/constants'
import CsvHelperDialog from '@/components/dialog/whakapapa/CsvHelperDialog.vue'
import isEmpty from 'lodash.isempty'
import * as d3 from 'd3'

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
    CsvHelperDialog
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
      csvHelper: false
    }
  },

  methods: {

    downloadCsv () {
      var csv = 'parentNumber,number,preferredName,legalName,gender,bornAt,diedAt,birthOrder,contact,location,profession,relationshipType\n'

      var hiddenElement = document.createElement('a')
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'whakapapa.csv'
      hiddenElement.click()
    },

    csvInfo () {
      this.csvHelper = !this.csvHelper
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
      this.errorMsg = []
      this.successMsg = []
      if (newValue != null) { this.checkFile(newValue) }
    },

    data (newValue) {
      if (newValue !== null) {
        var csv = d3.csvParse(newValue, function (d) {
          if (!isEmpty(d.number)) {
            return {
              parentNumber: d.parentNumber,
              number: d.number,
              preferredName: d.preferredName,
              legalName: d.legalName,
              gender: d.gender,
              bornAt: d.bornAt.split(/\//).reverse().join('/'),
              diedAt: d.diedAt.split(/\//).reverse().join('/'),
              birthOrder: Number(d.birthOrder),
              contact: d.contact,
              location: d.location,
              profession: d.profession,
              relationshipType: d.relationshipType ? d.relationshipType : 'birth'
            }
          }
        })
        // keep console.log for user support
        console.log(csv)
        this.successMsg = ['Expected result = Top ancestor: ' + csv[0].preferredName + '. First child: ' + csv[1].preferredName]
        this.$emit('update:data', csv)
      } else this.success = false
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
