<template>
  <DialogContainer :title="$t('instructionsWhakapapa.whakapapaInstructionsTitle')" :show="show" @close="close" :width="`550px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-0">
        {{ $t('instructionsWhakapapa.whakapapaRecord') }}
      </v-card-text>
      <v-divider />
      <p>
        {{ $t('instructionsWhakapapa.exampleImages') }}
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
    <template v-slot:actions>
      <v-col :align="mobile ? 'center' : 'end'" class="py-0">
        <v-btn
          text
          @click="close"
        >
           {{ $t('instructionsWhakapapa.close') }}
        </v-btn>
      </v-col>
    </template>
  </DialogContainer>
</template>

<script>
import DialogContainer from '@/components/dialog/DialogContainer.vue'
import treeURL from '@/assets/tree.webp'
import whakapapaList from '@/assets/whakapapa-list.webp'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'WhakapapaListHelper',
  data () {
    return {
      items: [
        { src: treeURL, text: 'an example whakapapa' },
        { src: whakapapaList, text: 'list of whakapapa records' }
      ]
    }
  },
  components: {
    DialogContainer
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    }
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
