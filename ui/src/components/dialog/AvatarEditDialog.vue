<template>
  <Dialog title="Crop Photo" :show="show" :width="width" :goBack="close" enableMenu dark
    @submit="submit"
    @close="close"
  >
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
          style="max-width: 300px"
          :min="0"
          :max="360"
        ></clipper-range>
      </div>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/dialog/Dialog.vue'
import uploadFile from '@/mixins/upload-file.js'

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
  mixins: [uploadFile],
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    size () {
      if (this.mobile) return 1
      switch (this.type) {
        case 'avatar': return 1
        case 'whakapapa': return 2
        case 'header': return 5
        default:
          return 1
      }
    },
    width () {
      if (this.mobile) return '720px'
      switch (this.type) {
        case 'avatar': return '500px'
        case 'whakapapa': return '600px'
        case 'header': return '800px'
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
        const canvas = this.$refs.avatar.clip({
          maxWPixel: this.type === 'header' ? 1920 : 800
        })
        canvas.toBlob(async blob => {
          const file = new File([blob], 'avatar', { type: blob.type })
          const image = await this.uploadFile({ file, encrypt: true })

          // TODO: HACK until mimeType: Hello World gets solved
          if (image.mimeType === null || image.mimeType === 'Hello World') image.mimeType = file.type

          // TODO: change when ssb-profile blobs are updated, need this because ssb-profile schema uses blob.blob not blob.blobId
          if (image.blobId) image.blob = image.blobId

          delete image.blobId

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
