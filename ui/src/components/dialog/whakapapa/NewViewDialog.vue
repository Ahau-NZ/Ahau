<template>
  <div>
    <Dialog :show="show" @close="close" width="720px" :goBack="close" enableMenu>
      <template v-slot:title>
        <h1>
            {{ text || 'Create a new whakapapa record' }}
        </h1>
      </template>
      <template v-slot:content>
        <WhakapapaForm ref="whakapapaForm" :view.sync="formData" :data.sync="csv"/>
      </template>
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
import Dialog from '@/components/dialog/Dialog.vue'
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'
import WhakapapaForm from '@/components/whakapapa-form/WhakapapaForm.vue'

const EMPTY_WHAKAPAPA = {
  name: '',
  description: '',
  mode: 'descendants',
  focus: 'self',
  image: null
}

const PERMITTED_WHAKAPAPA_ATTRS = [
  'name',
  'description',
  'mode',
  'focus',
  'image'
]

function setDefaultWhakapapa (whakapapa) {
  console.log('setting default whakapapa: ', whakapapa)
  return {
    name: whakapapa.name,
    description: whakapapa.description,
    mode: whakapapa.mode,
    focus: whakapapa.focus,
    image: whakapapa.image
  }
}

function whakapapaSubmission (newWhakapapa) {
  console.log('whakapapa submission: ', newWhakapapa)
  var output = {}
  var whakapapa = pick(newWhakapapa, [...PERMITTED_WHAKAPAPA_ATTRS])
  Object.entries(whakapapa).forEach(([key, value]) => {
    if (!isEmpty(whakapapa[key])) {
      output[key] = value
    }
  })
  return Object.assign({}, output)
}

export default {
  name: 'NewViewDialog',
  components: {
    Dialog,
    WhakapapaForm
  },
  props: {
    text: String,
    show: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      helpertext: false,
      formData: setDefaultWhakapapa(EMPTY_WHAKAPAPA),
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
      this.formData = setDefaultWhakapapa(EMPTY_WHAKAPAPA)
      this.$refs.whakapapaForm.$refs.form.reset()
      this.$emit('close')
    },
    submit () {
      if (!this.$refs.whakapapaForm.$refs.form.validate()) {
        console.error('not validated')
        return
      }
      const csv = this.csv
      const output = whakapapaSubmission(this.formData)
      const newOutput = {
        ...output,
        csv: csv
      }
      console.log('submit output', newOutput)
      this.$emit('submit', newOutput)
      this.close()
    },
    setFormData (whakapapa) {
      this.formData = whakapapa
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
