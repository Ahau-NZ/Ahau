<template>
  <div>
    <Dialog :show="show" title="Import people to tribal database" width="720px" :goBack="close" enableMenu
      @submit="submit"
      @close="close"
    >
      <template v-slot:content>
        <CsvImportInput :data.sync="data" :downloadTemplate="downloadTemplate" />
      </template>
    </Dialog>
  </div>
</template>

<script>

import Dialog from '@/components/dialog/Dialog.vue'
import CsvImportInput from '@/components/csvImport/CsvImportInput.vue'

import { mapActions } from 'vuex'

export default {
  name: 'ImportPeopleDialog',
  props: {
    title: String,
    show: {
      type: Boolean,
      required: true
    },
    downloadTemplate: Function
  },
  components: {
    Dialog,
    CsvImportInput
  },
  data () {
    return {
      data: null
    }
  },
  methods: {
    ...mapActions(['setLoading']),
    close () {
      this.$emit('close')
    },
    submit () {
      this.setLoading(true)
      this.$emit('submit', this.data)
      this.close()
    }
  }
}
</script>
