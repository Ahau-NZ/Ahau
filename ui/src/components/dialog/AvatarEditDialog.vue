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
import uploadFile from '@/mixins/upload-file'
import { makeFile } from '@/lib/file-helpers'

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
      const canvas = this.$refs.avatar.clip({
        maxWPixel: this.type === 'header' ? 1920 : 800
      })
      canvas.toBlob(async blob => {
        const file = makeFile(blob)

        if (file.size >= 5 * 1024 * 1024) {
          console.error('this avatar image is bigger than 5MB, we cannot allow this through, otherwise it will end up a hyperblob, which AvatarImage does not currently support')
          throw new Error('avatar image must me < 5MB')
        }

        const image = await this.uploadFile({ file, encrypt: true })

        if (image.mimeType === null) image.mimeType = file.type
        // TODO: HACK until mimeType: Hello World gets solved
        if (image.mimeType === 'Hello World') {
          image.mimeType = file.type
        }

        // NOTE: ssb-profile blobs uses blob.blob not blob.blobId (which are the artefact style)
        if (image.blobId) image.blob = image.blobId
        delete image.blobId

        const cleanImage = {}
        Object.entries(image).forEach(([key, value]) => {
          if (key === '__typename') return
          if (key === 'type') return
          cleanImage[key] = value
        })
        this.$emit('submit', cleanImage)
      })
    }
  }
}
</script>
