<template>
  <div v-if="clickable" @click="$emit('click')" style="cursor: pointer;">
    <v-col>
      <v-row justify="center">
        <v-avatar :size="size">
          <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
          <v-img v-else :src="getImage"/>
        </v-avatar>
      </v-row>
      <v-row v-if="showLabel" justify="center">
        {{ alt }}
      </v-row>
    </v-col>
  </div>

  <div v-else>
    <v-col>
      <v-row justify="center">
        <v-avatar :size="size">
          <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
          <v-img v-else :src="getImage"/>
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
    size: { type: String, default: '25vh' },
    showLabel: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false }
  },
  computed: {
    getImage () {
      return avatarHelper.defaultImage(this.bornAt, this.gender)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
