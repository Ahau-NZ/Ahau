<template>
  <Dialog :show="show" @close="close" :width="`80%`" :goBack="close">
    <template v-slot:title>
      <v-card-title>
        <span class="headline">Upload CSV Instructions </span>
      </v-card-title>
    </template>
    <template v-slot:content>
      <v-card-text class="pt-0">
        If you have a tribal registry or spreadsheet with your community members information you can use this file upload to import that information to create a whakapapa graph.
        These instructions will walk you through those steps to successfully upload this information. If you are having any issues with this please feel free to contact us at info@ahau.io and we will do our best to help you out.
      </v-card-text>
      <v-divider />
      <v-carousel hide-delimiters>
        <v-carousel-item
          v-for="(item,i) in items"
          :key="i"
          :src="item.src"
          class="centerImage"
        ></v-carousel-item>
      </v-carousel>
    </template>
  </Dialog>
</template>
<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'CsvHelperDialog',
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
</style>
