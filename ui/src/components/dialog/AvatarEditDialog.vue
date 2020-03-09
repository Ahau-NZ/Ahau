<template>
  <div>
    <Dialog :show="show" @close="close" width="600px" :goBack="close" enableMenu>
      <v-container style="background: black;">
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
          <h6 class="caption pt-8">
            <v-icon dark>mdi-gesture-tap</v-icon>
            Ajust the image by zooming, scaling and moving it around before
            saving.
          </h6>

          <h5 class="pt-8">rotate</h5>
          <clipper-range
            v-model="rotation"
            style="max-width:300px"
            :min="0"
            :max="360"
          ></clipper-range>

          <v-row class="actions py-6">
            <v-btn @click="close" text color="secondary" class="mr-4">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-btn @click="submit" text color="blue">
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-row>
        </div>
      </v-container>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog.vue'
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
