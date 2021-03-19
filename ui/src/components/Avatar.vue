<template>
  <!-- no avatar placeholder -->
  <div v-if="placeHolder">
    <img :src="require('@/assets/account.svg')"/>
    <div :class="isSideViewDialog ? 'side-view-picker-button' : 'image-picker-button'">
      <ImagePicker @updateAvatar="updateAvatar($event)" />
    </div>
  </div>
  <div v-else-if="clickable" @click="click" style="cursor: pointer;">
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
        <v-avatar :size="isSideViewDialog ? '250px': size" :tile="isView" class="avatar-container" :class="{'isEditing': isEditing, 'isOnline': online, 'reduceOpacity' : showPicker}">
          <v-img v-if="image && image.uri" :src="image.uri" :alt="alt" />
          <v-img
            v-else
            :src="getImage"
            :class="customClass"
          />
        </v-avatar>
        <div v-if="isEditing" :class="isSideViewDialog ? 'side-view-picker-button' : 'image-picker-button'">
          <ImagePicker @updateAvatar="updateAvatar($event)" />
        </div>
      </v-row>
      <v-row v-if="showLabel && !row" justify="center">
        <p :style="`font-size:0.8em ${theme};margin-bottom:0`" class="limit-text">{{ alt }} </p>
      </v-row>
    </v-col>
    <div v-if="showPicker " :class="isSideViewDialog ? 'side-view-picker-button' : 'image-picker-button'">
      <ImagePicker @updateAvatar="updateAvatar($event)" />
    </div>
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
    online: Boolean,
    showPicker: { type: Boolean, default: false },
    placeHolder: { type: Boolean, default: false },
    isSideViewDialog: { type: Boolean, default: false }
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

.image-picker-button {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 50%;
  backdrop-filter: opacity(0.1) blur(3px) saturate(5%) ;
  width: 100%;
  height: 100%;

  padding-top: 80%;
}

.side-view-picker-button {
  position: absolute;
  top: 91%
}

.limit-text {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
