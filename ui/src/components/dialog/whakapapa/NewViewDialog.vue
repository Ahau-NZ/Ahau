<template>
  <div>
    <DialogContainer :show="show" :title="title" width="720px" :goBack="closeOrCancel" enableMenu
      @submit="submit"
      @close="closeOrCancel"
      submit-label="next"
    >
      <template v-slot:content>
        <WhakapapaForm ref="whakapapaForm" :view.sync="formData" :importedData.sync="importedData"/>
        <AvatarGroup v-if="kaitiaki && kaitiaki.length > 0" size="50px" show-labels groupTitle="Kaitiaki" :profiles="kaitiaki" showLabels/>
      </template>
      <template v-if="accessOptions && accessOptions.length" v-slot:before-actions>
        <AccessButton type="whakapapa" :accessOptions="accessOptions" :permission.sync="formData.permission"/>
      </template>
    </DialogContainer>
  </div>
</template>

<script>
import { pick, isEmpty } from 'lodash-es'
import { mapActions, mapGetters } from 'vuex'

import DialogContainer from '@/components/dialog/DialogContainer.vue'
import WhakapapaForm from '@/components/whakapapa/WhakapapaForm.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import AccessButton from '@/components/button/AccessButton.vue'

const EMPTY_WHAKAPAPA = {
  name: '',
  description: '',
  mode: 'descendants',
  focus: 'new',
  image: null,
  permission: null
}

const PERMITTED_WHAKAPAPA_ATTRS = [
  'name',
  'description',
  'mode',
  'focus',
  'image',
  'permission'
]

function setDefaultWhakapapa (whakapapa) {
  return {
    name: whakapapa.name,
    description: whakapapa.description,
    mode: whakapapa.mode,
    focus: whakapapa.focus,
    image: whakapapa.image,
    permission: whakapapa.permission
  }
}

function whakapapaSubmission (newWhakapapa) {
  const output = {}
  const whakapapa = pick(newWhakapapa, [...PERMITTED_WHAKAPAPA_ATTRS])
  Object.entries(whakapapa).forEach(([key, value]) => {
    if (!isEmpty(whakapapa[key])) {
      output[key] = value
    }
  })
  return Object.assign({}, output)
}

export default {
  name: 'NewViewDialog',
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
      formData: setDefaultWhakapapa(EMPTY_WHAKAPAPA),
      importedData: null
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('tribe', ['accessOptions']),
    kaitiaki () {
      if (!this.whoami) return null
      return [this.whoami.public.profile]
    },
    position () {
      return this.mobile ? 'center' : 'start'
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    ...mapActions(['setLoading', 'setCurrentAccess']),
    closeOrCancel () {
      // need to reset the access, only when the close or cancel button was pressed
      // not when the submit is pressed
      if (this.accessOptions && this.accessOptions.length) this.setCurrentAccess(this.accessOptions[0])
      this.close()
    },
    close () {
      this.formData = setDefaultWhakapapa(EMPTY_WHAKAPAPA)
      this.$refs.whakapapaForm.$refs.form.reset()
      this.$emit('close')
    },
    submit () {
      this.setLoading(true)

      const output = whakapapaSubmission(this.formData)

      this.$emit('submit', { whakapapaInput: output, ...this.importedData })
      this.close()
    },
    setFormData (whakapapa) {
      this.formData = whakapapa
    }
  },
  components: {
    DialogContainer,
    WhakapapaForm,
    AvatarGroup,
    AccessButton
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
