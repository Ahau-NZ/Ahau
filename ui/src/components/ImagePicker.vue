<template>
  <div>
    <clipper-upload accept="image/*" @input="toggleAvatar">

      <v-row class="upload-pic-row">
        <v-icon class="grey--text pr-2 pt-1">mdi-camera</v-icon>
        <p class="toggle">
          {{ label || t('uploadPhoto')  }}
        </p>
      </v-row>

    </clipper-upload>
    <AvatarEditDialog
      v-if="avatar.showEditor"
      :show="avatar.showEditor"
      :avatarImage="avatar.new"
      @submit="updateAvatar($event)"
      @close="toggleAvatar(null)"
      :isView="isView"
      :type="type"
    />
  </div>
</template>

<script>
import AvatarEditDialog from '@/components/dialog/AvatarEditDialog.vue'

export default {
  name: 'ImagePicker',
  components: { AvatarEditDialog },
  props: {
    label: {
      type: String
    },
    isView: { type: Boolean, default: false },
    type: String
  },
  data () {
    return {
      avatar: {
        new: null,
        showEditor: false
      }
    }
  },
  methods: {
    toggleAvatar (file) {
      this.avatar.new = this.avatar.new ? null : file
      this.avatar.showEditor = !this.avatar.showEditor
    },
    updateAvatar (avatarImage) {
      this.$emit('updateAvatar', avatarImage)
      this.toggleAvatar(null)
    },
    t (key, vars) {
      return this.$t('addPersonForm.' + key, vars)
    }
  }
}
</script>

<style scoped lang="scss">
  .upload-pic-row {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    p.toggle {
      margin: 0px;
      font-size: 14px;
      color: rgba(0,0,0,0.8);
      background-color: rgba(255,255,255,0.5);
      cursor: pointer;
      font-weight: 400;
    }
  }
</style>
