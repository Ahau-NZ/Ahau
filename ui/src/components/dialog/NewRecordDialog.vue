<template>
  <div>
    <Dialog :show="show" :title="title" @close="close" width="70%" :goBack="close" enableMenu>

      <!-- FORM -->
      <template v-slot:content>
        <RecordForm ref="recordForm" :view.sync="formData" :data.sync="csv"/>
      </template>

      <!-- x ✓ BUTTONS -->
      <template v-slot:actions>
        <v-btn @click="close"
          text large fab
          class="secondary--text"
        >
          <v-icon color="secondary">mdi-close</v-icon>
        </v-btn>
        <v-btn @click="submit"
          text large fab
          class="blue--text"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </template>

    </Dialog>
  </div>
</template>

<script>
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'

import Dialog from '@/components/dialog/Dialog.vue'
import RecordForm from '@/components/record-form/RecordForm.vue'

const EMPTY_RECORD = {
  name: '',
  description: '',
  mode: 'descendants',
  focus: 'self',
  image: null
}

const PERMITTED_RECORD_ATTRS = [
  'name',
  'description',
  'mode',
  'focus',
  'image'
]

function setDefaultRecord (record) {
  return {
    name: record.name,
    description: record.description,
    mode: record.mode,
    focus: record.focus,
    image: record.image
  }
}

function recordSubmission (newRecord) {
  var output = {}
  var record = pick(newRecord, [...PERMITTED_RECORD_ATTRS])
  Object.entries(record).forEach(([key, value]) => {
    if (!isEmpty(record[key])) {
      output[key] = value
    }
  })
  return Object.assign({}, output)
}

export default {
  name: 'NewRecordDialog',
  components: {
    Dialog,
    RecordForm
  },
  props: {
    title: String,
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      helpertext: false,
      formData: setDefaultRecord(EMPTY_RECORD),
      csv: ''
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  watch: {
    formData: {
      handler (newVal) {
      },
      deep: true
    }
  },
  methods: {
    close () {
      this.formData = setDefaultRecord(EMPTY_RECORD)
      // this.$refs.recordForm.$refs.form.reset()
      this.$emit('close')
    },
    submit () {
      if (!this.$refs.recordForm.$refs.form.validate()) {
        console.error('not validated')
        return
      }
      const csv = this.csv
      const output = recordSubmission(this.formData)
      const newOutput = {
        ...output,
      }
      this.$emit('submit', newOutput)
      this.close()
    },
    setFormData (record) {
      this.formData = record
    }
  }
}
</script>

<style scoped lang="scss">
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
