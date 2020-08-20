<template>
  <div>
    <Dialog :show="show" :title="title" width="70%" :goBack="close" enableMenu
      @submit="submit"
      @close="close"
    >
      <template v-slot:content>
        <CollectionForm ref="collectionForm" :view.sync="formData"/>
      </template>
    </Dialog>
  </div>
</template>

<script>
import pick from 'lodash.pick'
import isEmpty from 'lodash.isempty'

import Dialog from '@/components/dialog/Dialog.vue'
import CollectionForm from '@/components/collection-form/CollectionForm.vue'

const EMPTY_COLLECTION = {
  name: '',
  description: '',
  mode: 'descendants',
  focus: 'self',
  image: null
}

const PERMITTED_COLLECTION_ATTRS = [
  'name',
  'description',
  'mode',
  'focus',
  'image'
]

function setDefaultCollection (whakapapa) {
  return {
    name: whakapapa.name,
    description: whakapapa.description,
    mode: whakapapa.mode,
    focus: whakapapa.focus,
    image: whakapapa.image
  }
}

function collectionSubmission (newCollection) {
  var output = {}
  var collection = pick(newCollection, [...PERMITTED_COLLECTION_ATTRS])
  Object.entries(collection).forEach(([key, value]) => {
    if (!isEmpty(collection[key])) {
      output[key] = value
    }
  })
  return Object.assign({}, output)
}

export default {
  name: 'NewCollectionDialog',
  components: {
    Dialog,
    CollectionForm
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
      formData: setDefaultCollection(EMPTY_COLLECTION)
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
      this.formData = setDefaultCollection(EMPTY_COLLECTION)
      this.$refs.collectionForm.$refs.form.reset()
      this.$emit('close')
    },
    submit () {
      if (!this.$refs.collectionForm.$refs.form.validate()) {
        console.error('not validated')
        return
      }
      const output = collectionSubmission(this.formData)
      const newOutput = {
        ...output
      }
      this.$emit('submit', newOutput)
      this.close()
    },
    setFormData (collection) {
      this.formData = collection
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
