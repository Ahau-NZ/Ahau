<template>
  <div v-if="clickable" @click="click" style="cursor: pointer;">
    <v-col class="py-0">
      <v-row justify="center" class="wrap">
        <v-btn :dark="dark" v-if="deletable" class="delete" @click="$emit('delete')" icon x-small light max-width="20px" max-height="20px">
          <v-icon :dark="dark">mdi-close</v-icon>
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
        <v-row v-if="showLabel && row">
          <v-col class="pl-7 pb-0" >
            <p class="mt-n1" :style="`font-size:1em; ${theme};`"> {{ alt }} </p>
          </v-col>
        </v-row>
      </v-row>
      <v-row v-if="showLabel && !row" justify="center">
        <p :style="`font-size:0.8em; ${theme}; margin-bottom:0`" class="limit-text"> {{ alt }} </p>
      </v-row>
    </v-col>
  </div>

  <div v-else-if="gender !== '' || (image && image.uri)">
    <v-col class="py-0">
      <v-row justify="center" class="wrap">
        <v-btn v-if="deletable" class="delete" @click="$emit('delete')" icon x-small light max-width="20px" max-height="20px">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-avatar :size="size" :tile="isView" class="avatar-container" :class="{'isEditing': isEditing, 'isOnline': online}">
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
      <v-row v-if="showLabel && !row" justify="center">
        <p :style="`font-size:0.8em ${theme};margin-bottom:0`" class="limit-text">{{ alt }} </p>
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
    aliveInterval: String,
    deceased: Boolean,
    size: { type: String, default: '25vh' },
    showLabel: Boolean,
    clickable: Boolean,
    isView: Boolean,
    isEditing: Boolean,
    deletable: Boolean,
    dark: Boolean,
    row: Boolean,
    online: Boolean
  },
  components: {
    ImagePicker
  },
  computed: {
    theme () {
      if (this.dark) return 'color: white;'
      return ''
    },
    getImage () {
      return avatarHelper.defaultImage(this.isView, this.aliveInterval, this.gender)
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
    },
    click () {
      this.$emit('click')
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

.isOnline {
  border: #37e259 solid 3px;
  border-radius: 50% !important;
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

.limit-text {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
