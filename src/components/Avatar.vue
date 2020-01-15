<template>
  <v-col>
    <v-row justify="center">
      <v-avatar :size="size">
        <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
        <v-img v-else :src="defaultImage"/>
      </v-avatar>
    </v-row>
    <v-row v-if="showLabel" justify="center">
      {{ alt }}
    </v-row>
  </v-col>
</template>

<script>
import koro from '@/assets/koro.svg'
import kuia from '@/assets/kuia.svg'
import tane from '@/assets/tane.svg'
import wahine from '@/assets/wahine.svg'
import tama from '@/assets/tama.svg'
import kotiro from '@/assets/kotiro.svg'
import unknown from '@/assets/unknown.svg' // TEMP
export default {
  name: 'Avatar',
  props: {
    image: Object,
    alt: String,
    size: { type: String, default: '25vh' },
    showLabel: { type: Boolean, default: false },
    gender: String
  },
  computed: {
    defaultImage () {
      switch (this.gender) {
        case 'male': return tane
        case 'female': return wahine
        default: return unknown
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
