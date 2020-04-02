<template>
  <Dialog :title="`Whakapapa ---- Family tree`" :show="show" @close="close" :width="`550px`" :goBack="close">
    <!-- <template v-slot:title>
      <v-card-title>
        <span class="headline">Whakapapa records</span>
      </v-card-title>
    </template> -->
    <template v-slot:content>
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
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'WhakapapaListHelper',
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
