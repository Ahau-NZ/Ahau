<template>
  <Dialog :title="`Crop Photo`" :show="show" @close="close" width="600px" :goBack="close" enableMenu background="black">
    <template v-slot:content>
      <v-row justify="center">
        <v-col style="max-width: 400px;">
          <clipper-fixed
            ref="avatar"
            :grid="false"
            :src="avatarImage"
            :area="100"
            bg-color="rgba(0, 0, 0, 0)"
            :round="!isView"
            shadow="rgba(0,0,0,0.5)"
            :rotate="rotation"
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
import gql from 'graphql-tag'

export default {
  name: 'AvatarEditDialog',
  components: {
    Dialog
  },
  props: {
    show: { type: Boolean, default: false },
    avatarImage: String,
    isView: { type: Boolean, default: false }
  },
  data () {
    return {
      rotation: 0
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

          const result = await this.$apollo.mutate({
            mutation: gql`
              mutation uploadFile($file: Upload!) {
                uploadFile(file: $file) {
                  blob
                  mimeType
                  uri
                }
              }
            `,
            variables: {
              file
            }
          })

          if (result.errors) throw result.errors

          let cleanImage = {}
          Object.entries(result.data.uploadFile).forEach(([key, value]) => {
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
