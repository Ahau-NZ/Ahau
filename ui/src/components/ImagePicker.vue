<template>
  <div>
    <clipper-upload accept="image/*" @input="toggleAvatar">
      <v-btn v-if="!avatar.new" class="toggle" fab small color="white">
        <v-icon class="black--text">mdi-pencil</v-icon>
      </v-btn>
      &nbsp; &nbsp; Upload profile photo
    </clipper-upload>
    <AvatarEditDialog
      :show="avatar.showEditor"
      :avatarImage="avatar.new"
      @submit="updateAvatar($event)"
      @close="toggleAvatar(null)"
    />
  </div>
</template>

<script>
import AvatarEditDialog from '@/components/dialog/AvatarEditDialog.vue'

export default {
  name: 'ImagePicker',
  components: { AvatarEditDialog },
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
