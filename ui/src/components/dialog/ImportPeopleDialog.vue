<template>
  <div>
    <DialogContainer :show="show" title="Import people to tribal database" width="720px" :goBack="close" enableMenu
      @submit="submit"
      @close="close"
    >
      <template v-slot:content>
        <CsvImportInput :importedData.sync="importedData" :downloadTemplate="downloadTemplate" />
      </template>
    </DialogContainer>
  </div>
</template>

<script>

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
    CsvImportInput
  },
  data () {
    return {
      importedData: null
    }
  },
  methods: {
    ...mapActions(['setLoading']),
    close () {
      this.$emit('close')
    },
    submit () {
      this.setLoading(true)
      this.$emit('submit', this.importedData)
      this.close()
    }
  }
}
</script>
