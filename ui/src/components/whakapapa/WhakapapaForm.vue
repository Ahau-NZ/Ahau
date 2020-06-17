<template>
  <v-form ref="form" v-model="form.valid" lazy-validation>
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
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
    <CsvHelperDialog :show="csvHelper" @click="csvInfo()" @close="csvInfo()"/>
    <CsvErrorDialog :show="csvErrorShow" :errorMsgs="errorMsgs" @click="csvErrorClose()" @close="csvErrorClose()"/>
  </v-form>
</template>
<script>

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import { RULES } from '@/lib/constants'
import CsvHelperDialog from '@/components/dialog/whakapapa/CsvHelperDialog.vue'
import CsvErrorDialog from '@/components/dialog/whakapapa/CsvErrorDialog.vue'
import * as csv from '@/lib/csv'

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
      errorMsgs: [],
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
    file (newFile) {
      if (newFile == null) return

      this.errorMsgs = []
      this.successMsg = []

      csv.importCsv(newFile)
        .then(csv => {
          this.successMsg = ['Expected result = Top ancestor: ' + csv[0].preferredName + '. First child: ' + csv[1].preferredName]
          this.$emit('update:data', csv)
        })
        .catch(errs => {
          this.errorMsgs = errs
          this.csvErrorShow = true
        })
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
    csvErrorClose () {
      this.resetFile()
      this.csvErrorShow = false
    },
    resetFile () {
      this.file = null
      this.errorMsgs = []
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
