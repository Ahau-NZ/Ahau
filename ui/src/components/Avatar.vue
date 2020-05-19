<template>
  <div v-if="clickable" @click="$emit('click')" style="cursor: pointer;" >
    <v-col class="py-0">
      <v-row justify="center" class="wrap">
        <v-btn v-if="deletable" class="delete" @click="$emit('delete')" icon x-small light max-width="20px" max-height="20px">
          <v-icon>mdi-close</v-icon>
        </v-btn>
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

  <div v-else-if="gender !== '' || (image && image.uri)">
    <v-col>
      <v-row justify="center" class="wrap">
        <v-btn v-if="deletable" class="delete" @click="$emit('delete')" icon x-small light max-width="20px" max-height="20px">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-avatar :size="size" :tile="isView" class="avatar-container" :class="{'isEditing': isEditing}">
          <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
          <v-img
            v-else
            :src="getImage"
            :class="customClass"
            :style="customStyle"
          />
        </v-avatar>
        <div v-if="isEditing" class="avatar-overlay">
          <ImagePicker @updateAvatar="updateAvatar($event)" />
        </div>
      </v-row>
      <v-row v-if="showLabel" justify="center">
        {{ alt }}
      </v-row>
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
    gender: String,
    bornAt: String,
    deceased: { type: Boolean, default: false },
    size: { type: String, default: '25vh' },
    showLabel: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    isView: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false },
    deletable: { type: Boolean, default: false }
  },
  components: {
    ImagePicker
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

  },
  methods: {
    updateAvatar (avatarImage) {
      this.$emit('updateAvatar', avatarImage)
    }
  }
}
</script>

<style scoped lang="scss">
.wrap {
  position: relative;
}

.wrap .delete {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 100;
}

.avatar-container {
  position: relative;
  text-align: center;
  color: white;

}

.isEditing {
    opacity: 0.2;
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
  backdrop-filter: opacity(0.1) blur(3px) saturate(5%) ;
  width: 100%;
  height: 100%;
}
</style>
