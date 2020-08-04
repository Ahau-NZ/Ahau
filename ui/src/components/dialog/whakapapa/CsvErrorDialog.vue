<template>
  <Dialog :title="'Could not build whakapapa record'" :show="show" @close="close" :width="'720px'" :goBack="close">

    <template v-slot:content>
      <v-card-text class="pt-8">
        There was a problem with the CSV file you uploaded.
      </v-card-text>

      <v-card-text class="pt-0">
        <v-simple-table fixed-header dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Row</th>
                <th class="text-left">Field</th>
                <th class="text-left">Error</th>
                <th class="text-left">Value Given</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="{ row, field, error, value } in errorMsgs" :key="`${row}-${field}`">
                <td> {{ row }} </td>
                <td> {{ field }} </td>
                <td> {{ error }} </td>
                <td> {{ value }} </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
      <v-card-text class="pt-8">
        Fix these and try uploading again
      </v-card-text>

      <!-- <v-divider /> -->

      <v-row class="justify-end ma-0">
        <v-btn @click="close"
        text large fab
        class="blue--text"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
      </v-row>

    </template>
  </Dialog>
</template>
<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true },
    errorMsgs: { type: Array }
  },
  name: 'CsvErrorDialog',
  data () {
    return {
      items: [
        { src: require('../../../assets/tree.jpg') },
        { src: require('../../../assets/whakapapa-list.jpg') }
      ]
    }
  },
  components: {
    Dialog
  },
  methods: {
    cordovaBackButton () {
      this.close()
    },
    close () {
      this.$emit('close')
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
