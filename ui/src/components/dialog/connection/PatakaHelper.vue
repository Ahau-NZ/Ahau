<template>
  <Dialog :title="t('titlePataka')" :show="show" @close="close" :width="`700px`" :goBack="close">
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
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'

export default {
  props: {
    show: { type: Boolean, required: true }
  },
  name: 'PatakaHelper',
  data () {
    return {
      items: [
        { src: require('@/assets/animations/replication-via-internet_css.svg'),
          text: this.t('replication')
        },
        { src: require('@/assets/animations/data-on-a-pātaka_css.svg'),
          text: this.t('onPataka')
        },
        { src: require('@/assets/animations/corporate-server.svg'),
          text: this.t('corporateServer')
        },
        { src: require('@/assets/animations/alternative-servers.svg'),
          text: this.t('ahauServer')
        }
      ]
    }
  },
  components: {
    Dialog
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
