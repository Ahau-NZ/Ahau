<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-row class="px-4">
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
            <ImagePicker :label="t('editImage')"
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
              :label="t('name')"
              placeholder=" "
              hide-details
              :rules="rules.name.whakapapaView"
            />
          </v-col>
          <!-- Description textarea -->
          <v-col cols="12" class="pa-1">
            <v-textarea
              v-model="formData.description"
              :label="t('description')"
              placeholder=" "
              hide-details
              no-resize
              rows="1"
              auto-grow
            ></v-textarea>
          </v-col>
          <v-col cols="12" class="pa-1 pt-10" v-if="!hideDetails">
            {{ t('start') }}
          </v-col>
          <v-col cols="12" class="pa-1" v-if="!hideDetails">
            <v-radio-group v-model="formData.focus">
              <!-- <v-radio :label="t('yourself')" value="self"></v-radio> -->
              <v-radio :label="t('anotherPerson')" value="new"></v-radio>
              <v-radio :label="t('csvImport')" value="file"></v-radio>
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
            <v-col>
              <CsvImportInput :importedData.sync="importedData" :downloadTemplate="downloadTemplate" />
            </v-col>
          </v-row>
        </v-row>
      </v-col>
    </v-row>
    <CsvHelperDialog v-if="csvHelper" :show="csvHelper" @click="csvInfo()" @close="csvInfo()"/>
  </v-form>
</template>
<script>

import { mapMutations } from 'vuex'

import { RULES } from '@/lib/constants'
import { downloadCsv } from '@/lib/csv'

import Avatar from '@/components/Avatar.vue'
import ImagePicker from '@/components/ImagePicker.vue'
import CsvHelperDialog from '@/components/dialog/whakapapa/CsvHelperDialog.vue'
import CsvImportInput from '@/components/csvImport/CsvImportInput.vue'

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

export default {
  name: 'WhakapapaForm',
  components: {
    Avatar,
    ImagePicker,
    CsvHelperDialog,
    CsvImportInput
  },
  props: {
    view: Object,
    readonly: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false }
  },
  mounted () {
    setDefaultWhakapapa(this.view)
    this.$refs.form.validate()
  },
  data () {
    return {
      formData: this.view,
      rules: RULES,
      valid: false,
      importedData: null,
      csvHelper: false
    }
  },
  watch: {
    valid (valid) {
      this.setAllowSubmissions(valid)
    },
    formData: {
      deep: true,
      handler (newVal) {
        this.$emit('update:view', newVal)
      }
    },
    importedData: {
      deep: true,
      handler (val) {
        this.$emit('update:importedData', val)
      }
    }
  },
  methods: {
    ...mapMutations(['setAllowSubmissions']),
    downloadTemplate: downloadCsv,
    csvInfo () {
      this.csvHelper = !this.csvHelper
    },
    t (key, vars) {
      return this.$t('addWhakapapaForm.' + key, vars)
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
