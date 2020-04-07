<template>
  <div v-if="clickable" @click="$emit('click')" style="cursor: pointer;">
    <v-col>
      <v-row justify="center">
        <v-avatar :size="size" :tile="isView">
          <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
          <v-img
            v-else
            :src="getImage"
            :class="customClass"
            :style="customStyle"
          />
        </v-avatar>
      </v-row>
      <v-row v-if="showLabel" justify="center">
        {{ alt }}
      </v-row>
    </v-col>
  </div>

  <div v-else-if="gender !== ''">
    <v-col>
      <v-row justify="center">
        <v-avatar :size="size" :tile="isView">
          <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
          <v-img
            v-else
            :src="getImage"
            :class="customClass"
            :style="customStyle"
          />
        </v-avatar>
      </v-row>
      <v-row v-if="showLabel" justify="center">
        {{ alt }}
      </v-row>
    </v-col>
  </div>
</template>

<script>
import avatarHelper from '@/lib/avatar-helpers.js'

export default {
  name: 'Avatar',
  props: {
    image: Object,
    alt: String,
    gender: String,
    bornAt: String,
    deceased: { type: Boolean, default: false },
    size: { type: String, default: '25vh' },
    showLabel: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    isView: { type: Boolean, default: false }
  },
  computed: {
    getImage () {
      return avatarHelper.defaultImage(this.isView, this.bornAt, this.gender)
    },
    customClass () {
      if (this.isView) return ''
      return this.deceased ? 'deceased' : 'alive'
    },
    customStyle () {
      if (this.isView) return ''
      return {
        opacity: this.deceased ? 0.5 : 1
      }
    }

  }
}
</script>
