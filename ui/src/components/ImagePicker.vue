<template>
  <div>
    <clipper-upload accept="image/*" @input="toggleAvatar">
      <v-btn v-if="!avatar.new" class="toggle" fab small color="white">
        <v-icon class="black--text">mdi-pencil</v-icon>
      </v-btn>
      &nbsp; &nbsp; {{ label }}
    </clipper-upload>
    <AvatarEditDialog
      :show="avatar.showEditor"
      :avatarImage="avatar.new"
      @submit="updateAvatar($event)"
      @close="toggleAvatar(null)"
      :isView="isView"
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
      type: String,
      default: 'Upload profile photo'
    },
    isView: { type: Boolean, default: false }
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
    }
  }
}
</script>
