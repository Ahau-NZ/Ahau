<template>
  <Dialog :title="'Pūranga ---- Archive'" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <p>
          An Archive is where you create and access private and community records.
        </p>
        <p>
          All records that are created are fully encrypted to either your personal archive (which can only be accessed by you) or community archive (which can only be accessed by approved community members) basded on the access that you set when creating a record. <br>
          Your Personal Archive gets created when you start Ahau, and a Community Archive gets created when a community profile is created.
        </p>
      </v-card-text>
      <v-divider />
      <p>
          Example images
      </p>
      <v-carousel hide-delimiters>
        <v-tooltip
          v-for="(item,i) in items"
          :key="i" top>
          <template v-slot:activator="{ on }">
            <v-carousel-item
              v-on="on"
              :src="item.src"
              class="centerImage"
            ></v-carousel-item>
          </template>
          <span> {{item.text}} </span>
        </v-tooltip>
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
        { src: require('../../../assets/tree.jpg'),
          text: 'an example whakapapa' },
        { src: require('../../../assets/whakapapa-list.jpg'),
          text: 'list of whakapapa records' }
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
/* .centerImage {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 20em;
  height:auto
} */
</style>
