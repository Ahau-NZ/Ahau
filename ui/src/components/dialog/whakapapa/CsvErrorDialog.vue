<template>
  <Dialog :title="title" :show="show" @close="close" :width="'720px'" :goBack="close">

    <template v-slot:content>
      <v-card-text class="pt-8">
        There was a problem with the CSV file you uploaded.
      </v-card-text>

      <v-card-text class="pt-0">
        <v-data-table
          :items="errorMsgs"
          fixed-header
          dense
          sort-by="row"
          :headers="headers"
        >
        </v-data-table>
      </v-card-text>
      <v-card-text class="pt-8">
        Fix these and try uploading again
      </v-card-text>
    </template>
    <template v-slot:actions>
      <v-col :align="mobile ? 'center' : 'end'" class="py-0">
        <v-btn
          text
          @click="close"
        >
          close
        </v-btn>
      </v-col>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import treeURL from '@/assets/tree.jpg'
import whakapapaListURL from '@/assets/whakapapa-list.jpg'

export default {
  props: {
    show: { type: Boolean, required: true },
    errorMsgs: { type: Array },
    type: { type: String }
  },
  name: 'CsvErrorDialog',
  data () {
    return {
      headers: [
        { text: 'Row', value: 'row' },
        { text: 'Field', value: 'field' },
        { text: 'Error', value: 'error' },
        { text: 'Value given', value: 'value' }
      ],
      items: [
        { src: treeURL },
        { src: whakapapaListURL }
      ]
    }
  },
  components: {
    Dialog
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    title () {
      return this.type ? this.t('people') : this.t('whakapapa')
    }
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
    },
    t (key, vars) {
      return this.$t('importPeopleForm.' + key, vars)
    }
  }
}
</script>
<style>
.centerImage {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 20em;
  height:auto
}

.errorMsg {
  color: red;
  padding: 2px;
}

</style>
