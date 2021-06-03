<template>
  <Dialog :title="t('titlePataka')" :show="show" @close="close" :width="`700px`" :goBack="close">
    <template v-slot:content>
      <v-card-text class="pt-4">
        <p>{{ t('description') }}</p>
        <p>{{ t('difference') }}</p>
        <p>{{ t('setup') }}</p>
        <p>{{ t('ahau') }}</p>
        <p>{{ t('ecryption') }}</p>
        <p>{{ t('info') }}</p>
      </v-card-text>
      <v-divider />
      <!-- <p>
          {{ t('exampleImages') }}
      </p> -->
      <!-- <v-carousel hide-delimiters height="100%">
        <v-tooltip
          v-for="(item,i) in examples"
          :key="i" top>
          <template v-slot:activator="{ on }">
            <v-carousel-item
              v-on="on"
              :src="item.src"
              style="background-size:contain"
            ></v-carousel-item>
          </template>
          <span> {{item.text}} </span>
        </v-tooltip>
      </v-carousel> -->
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
      items:[
      ],
      mobileItems: [
      ]
    }
  },
  components: {
    Dialog
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    examples () {
      if (this.mobile) return this.mobileItems
      return this.items
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
