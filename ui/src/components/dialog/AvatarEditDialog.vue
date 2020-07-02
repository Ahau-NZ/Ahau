<template>
  <Dialog :title="`Crop Photo`" :show="show" @close="close" :width="width" :goBack="close" enableMenu background="black">
    <template v-slot:content>
      <v-row justify="center">
        <v-col :width="width">
          <clipper-fixed
            ref="avatar"
            :grid="false"
            :src="avatarImage"
            :area="100"
            bg-color="rgba(0, 0, 0, 0)"
            :round="!isView"
            shadow="rgba(0,0,0,0.5)"
            :rotate="rotation"
            :ratio="size"
          />
        </v-col>
      </v-row>

      <div class="px-8 py-4">
        <h6 class="caption pt-8 white--text">
          <v-icon dark>mdi-gesture-tap</v-icon>
          Adjust the image by zooming, scaling and moving it around before
          saving.
        </h6>

        <h5 class="pt-8 white--text">rotate</h5>
        <clipper-range
          v-model="rotation"
          style="max-width:300px"
          :min="0"
          :max="360"
        ></clipper-range>
      </div>
    </template>
    <template v-slot:actions>
      <v-btn @click="close"
        text large fab
        class="secondary--text"
      >
        <v-icon color="secondary">mdi-close</v-icon>
      </v-btn>
      <v-btn @click="submit"
        text large fab
        class="blue--text"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import { UPLOAD_FILE } from '@/lib/file-helpers.js'

export default {
  name: 'AvatarEditDialog',
  components: {
    Dialog
  },
  props: {
    show: { type: Boolean, default: false },
    avatarImage: String,
    isView: { type: Boolean, default: false },
    type: { type: String, default: 'avatar' }
  },
  data () {
    return {
      rotation: 0
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    size () {
      if (this.mobile) return 1
      switch (this.type) {
        case 'avatar': return 1
        case 'whakapapa': return 2
        case 'header': return 6
        default:
          return 1
      }
    },
    width () {
      if (this.mobile) return '720px'
      switch (this.type) {
        case 'avatar': return '500px'
        case 'whakapapa': return '600px'
        case 'header': return '1000px'
        default:
          return 1
      }
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },
    async submit () {
      try {
        const canvas = this.$refs.avatar.clip({ maxWPixel: 1920 })
        canvas.toBlob(async blob => {
          const file = new File([blob], 'avatar', { type: blob.type })

          const result = await this.$apollo.mutate(UPLOAD_FILE({ file, encrypt: true }))
          if (result.errors) throw result.errors

          var image = result.data.uploadFile
          if (image.mimeType === null) image.mimeType = file.type

          let cleanImage = {}
          Object.entries(image).forEach(([key, value]) => {
            if (key !== '__typename') cleanImage[key] = value
          })
          this.$emit('submit', cleanImage)
        })
      } catch (error) {
        throw error
      }
    }
  }
}
</script>
