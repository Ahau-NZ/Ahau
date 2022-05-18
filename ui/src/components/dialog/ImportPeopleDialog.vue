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
        </v-row>
      </template>
    </Dialog>
    <CsvErrorDialog v-if="csvErrorShow" :show="csvErrorShow" :errorMsgs="errorMsgs" type="people" @click="csvErrorClose()" @close="csvErrorClose()"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { RULES } from '@/lib/constants'
import CsvErrorDialog from '@/components/dialog/whakapapa/CsvErrorDialog.vue'
import { importCsv, downloadCsv } from '@/lib/csv'

import Dialog from '@/components/dialog/Dialog.vue'
// import AccessButton from '@/components/button/AccessButton.vue'

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
      form: {
        valid: true,
        rules: RULES
      },
      file: null,
      errorMsgs: [],
      successMsg: [],
      noErrorsInCSV: true,
      csvErrorShow: false,
      csv: ''
    }
  },
  watch: {
    file (newFile) {
      if (newFile == null) return

      this.errorMsgs = []
      this.successMsg = []

      importCsv(newFile, 'people')
        .then(csv => {
          this.successMsg = ['Expected result = first person: ' + csv[0].profile.preferredName + '. Second person: ' + csv[1].profile.preferredName]
          this.csv = csv
        })
        .catch(errs => {
          this.errorMsgs = errs
          this.csvErrorShow = true
        })
    }
  },
  computed: {
    ...mapGetters(['whoami']),
    ...mapGetters('tribe', ['accessOptions'])
  },
  methods: {
    ...mapActions(['setLoading', 'setCurrentAccess']),
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
      this.setLoading(true)
      this.$emit('submit', this.csv)
      this.close()
    },
    t (key, vars) {
      return this.$t('importPeopleForm.' + key, vars)
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
</style>
