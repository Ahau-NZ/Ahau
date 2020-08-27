<template>
  <div v-if="clickable" @click="$emit('click')" style="cursor: pointer;">
    <v-col>
      <v-row justify="center">
        <v-avatar :size="size" :tile="isView">
          <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
          <v-img v-else :src="getImage" :style="customStyle" />
        </v-avatar>
      </v-row>
      <v-row v-if="showLabel" justify="center">{{ alt }}</v-row>
    </v-col>
  </div>

  <div v-else>
    <v-col>
      <v-row justify="center">
        <v-avatar
          :size="size"
          :tile="isView"
          class="avatar-container"
          :class="{'isEditing': isEditing}"
        >
          <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
          <v-img v-else :src="getImage" class="no-pic" :style="customStyle" />
        </v-avatar>
        <div v-if="isEditing" class="avatar-overlay">
          <ImagePicker @updateAvatar="updateAvatar($event)" />
        </div>
      </v-row>
      <v-row v-if="showLabel" justify="center">{{ alt }}</v-row>
    </v-col>
  </div>
</template>

<script>
import avatarHelper from '@/lib/avatar-helpers.js'
import ImagePicker from '@/components/ImagePicker.vue'

export default {
  name: 'Avatar',
  props: {
    image: Object,
    alt: String,
    size: { type: String, default: '25vh' },
    showLabel: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    isView: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false },
    offline: { type: Boolean, default: false }

  },
  computed: {
    getImage () {
      return avatarHelper.defaultImage(this.isView, this.aliveInterval, this.gender)
    },
    customStyle () {
      return {
        opacity: this.offline ? 0.5 : 1
      }
    }

  },
  components: {
    ImagePicker
  },
  methods: {
    updateAvatar (avatarImage) {
      this.$emit('updateAvatar', avatarImage)
    }
  }
}
</script>

<style scoped lang="scss">
.avatar-container {
  position: relative;
  text-align: center;
  color: white;
  background: white;
}

.isEditing {
  opacity: 0.2;
}

.no-pic {
  background: grey;
  padding: 15px;
}

.avatar-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 50%;
  backdrop-filter: opacity(0.1) blur(3px) saturate(5%);
  width: 100%;
  height: 100%;
}
</style>
