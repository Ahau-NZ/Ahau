<template>
  <Dialog :show="show" @close="close" :width="`500px`" :goBack="close">
    <v-card>
      <v-row class="mr-0">
      <v-col class="py-0" cols="10">
      <v-card-title>
        <span class="headline">Whakapapa records</span>
      </v-card-title>
      </v-col>
      <v-col class="pb-0" align="right" cols="2">
        <!-- Dialog close button -->
        <v-btn @click="close" class="close" fab text color="secondary">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
      </v-row>
      <v-card-text class="pt-0">
        In Āhau a whakapapa record is a genealogy graph. You can create as many whakapapa records as you like to represent the many different family lines that you belong to.
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
    </v-card>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'WhakapapaListHelper',
  data () {
    return {
      items: [
        { src: require('../../assets/tree.jpg') },
        { src: require('../../assets/whakapapa-list.jpg') }
      ]
    }
  },
  methods: {
    close () {
      this.$emit('close')
    }
  },
  components: {
    Dialog
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
