<template>
  <DialogContainer :title="t('titlePataka')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4" style="color:black">
        <p>{{ t('description') }}</p>
        <p>{{ t('difference') }}</p>
        <p>{{ t('setup') }} {{ t('patakaDescription') }} </p>
        <p>{{ t('ahau') }}</p>
        <p>{{ t('ecryption') }}</p>
        <p>{{ t('info') }} <a href="https://docs.ahau.io/#/pataka-guide" target="_blank">https://docs.ahau.io</a></p>
      </v-card-text>
      <v-divider />
      <p>
        {{ t('exampleImages') }}
      </p>
      <v-carousel hide-delimiters height="300px" class="mb-12">
        <v-tooltip
          v-for="(item,i) in items"
          :key="i" top>
          <template v-slot:activator="{ on }">
            <v-carousel-item
              v-on="on"
              :src="item.src"
            >
            </v-carousel-item>
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
          {{ t('close') }}
        </v-btn>
      </v-col>
    </template>
  </DialogContainer>
</template>

<script>
import DialogContainer from '@/components/dialog/DialogContainer.vue'
import replicateURL from '@/assets/animations/replication-via-internet_css.svg'
import patakaURL from '@/assets/animations/data-on-a-pātaka_css.svg'
import corporateURL from '@/assets/animations/corporate-server.svg'
import alternativeURL from '@/assets/animations/alternative-servers.svg'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'PatakaHelper',
  data () {
    return {
      items: [
        { src: replicateURL, text: this.t('replication') },
        { src: patakaURL, text: this.t('onPataka') },
        { src: corporateURL, text: this.t('corporateServer') },
        { src: alternativeURL, text: this.t('ahauServer') }
      ]
    }
  },
  components: {
    DialogContainer
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
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
      return this.$t('patakaInstruction.' + key, vars)
    }
  }
}
</script>
<style scoped>
.image {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: auto;
  height:auto
}

</style>
