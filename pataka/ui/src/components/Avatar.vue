<template>
  <div>
    <v-col>
      <v-row justify="center">
        <v-hover v-slot="{ hover }">
          <v-avatar
            :size="size"
            :tile="isView"
            class="avatar-container"
            :class="{'isEditing': isEditing}"
            :dark="dark"
          >
            <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
            <v-img v-else :src="getImage" class="no-pic" :style="customStyle"/>
            <v-overlay
              absolute
              opacity="0.5"
              :value="hover && showLabel"
            >
              <p class="text-center pt-2" style="font-size:12px">{{alt}}</p>
            </v-overlay>
          </v-avatar>
        </v-hover>
      </v-row>
    </v-col>
  </div>

</template>

<script>
import avatarHelper from '@/lib/avatar-helpers.js'
// import ImagePicker from '@/components/ImagePicker.vue'
import logo from '../assets/logo_black.svg'

export default {
  name: 'Avatar',
  props: {
    showOnHover: Boolean,
    image: Object,
    alt: String,
    gender: String,
    aliveInterval: String,
    type: { type: String, default: 'person' },
    size: { type: String, default: '25vh' },
    showLabel: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    isView: { type: Boolean, default: false },
    isEditing: { type: Boolean, default: false },
    offline: { type: Boolean, default: false },
    dark: Boolean
  },
  data: function () {
    return {
      hovered: false
    }
  },
  computed: {
    getImage () {
      if (this.type === 'person') return avatarHelper.defaultImage(this.isView, this.aliveInterval, this.gender)
      else return logo
    },
    customStyle () {
      return {
        opacity: this.offline ? 0.5 : 1
      }
    }
  },
  components: {
    // ImagePicker
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
}

.hoverName {
  position: relative;
  padding: 2px 5px;
  width: 200px;
  text-align: left;
  top: -10px;
  opacity: 0;
  z-index: 99;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.2);
}

.show {
  opacity: 1;
}
.isEditing {
  opacity: 0.2;
}

.no-pic {
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
