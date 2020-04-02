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
          <v-row v-if="formData.focus == 'file'">
            <v-col cols="9" class="py-0">
              <v-file-input
              class="pt-0"
              v-model="file"
              show-size
              accept=".csv"
              label="File input"
              :success="success"
              :success-messages="successMsg"
              :error="error"
              :error-messages="errorMsg"
              @click:clear="resetFile()"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
  </v-form>
</template>
<script>

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import { RULES } from '@/lib/constants'

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
    ImagePicker
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
      success: false,
      error: false,
      errorMsg: [],
      successMsg: []
    }
  },

  methods: {

    checkFile (file) {
      if (this.file.name.split('.').pop() !== 'csv') { // check if file extension is csv
        this.error = true
        this.errorMsg = ['please upload a CSV file']
      } else {
        var reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
          this.data = reader.result
        }
        console.log("data: ", this.data)
        this.success = true
      }
    },

    resetFile () {
      this.file = null,
      this.data = null,
      this.error = false
      this.success = false
      this.errorMsg = []
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
      this.error = false
      this.success = false
      if (newValue != null) { this.checkFile(newValue) }
    },

    data (newValue) {
      this.$emit('update:data', newValue)
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
