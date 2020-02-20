<template>
  <v-container class="header my-0 py-0" :class="mobile ? 'mobile' : 'desktop'">
    <v-row class="header-row" v-if="!mobile">
      <v-img
        v-if="!header.new"
        :src="headerImage ? headerImage.uri : ''"
        class="header-image"
      />
      <div v-if="header.overlay" class="header-editor">
        <clipper-fixed
          ref="headerClipper"
          :min-scale="0.5"
          :grid="false"
          :ratio="16 / 3"
          :area="100"
          :src="header.new"
          border-color="black"
          bg-color="rgba(0, 0, 0, 0)"
          :round="false"
          shadow="rgba(0,0,0,0.5)"
          :rotate="header.rotation"
        />
        <div class="controls px-4 py-4">
          <h6 class="caption pt-8">
            <v-icon>mdi-gesture-tap-hold</v-icon>
            Ajust the image by zooming, scaling and moving it around before
            saving.
          </h6>

          <h5 class="pt-4">rotate</h5>
          <clipper-range
            v-model="header.rotation"
            style="max-width:300px"
            :min="0"
            :max="360"
          ></clipper-range>

          <v-row class="actions py-6">
            <v-btn
              @click="toggleUpdateHeader(null)"
              text
              color="secondary"
              class="mr-4"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-btn @click="handleImageUpload('header')" text color="blue">
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-row>
        </div>
      </div>

      <clipper-upload
        v-if="!header.new"
        @input="toggleUpdateHeader"
        accept="image/*"
        class="edit-header-button"
      >
        <v-btn fab color="white">
          <v-icon class="black--text">mdi-pencil</v-icon>
        </v-btn>
        <span class="white--text pl-4 title">Upload header photo</span>
      </clipper-upload>
    </v-row>

    <v-row class="avatar-row" :class="{ 'my-4': mobile }">
      <v-row class="avatar-box">
        <clipper-upload
          v-if="!header.overlay"
          class="avatar-picker"
          accept="image/*"
          @input="toggleUpdateAvatar"
        >
          <v-btn v-if="!avatar.new" class="toggle" fab color="white">
            <v-icon class="black--text">mdi-camera</v-icon>
          </v-btn>
          <span class="caption pt-4">Add profile photo</span>
        </clipper-upload>

        <Avatar
          v-if="!avatar.new"
          :image="avatarImage"
          :alt="preferredName"
          :size="mobile ? '25vh' : '18vh'"
          class="my-n3"
        />

        <v-overlay :value="avatar.overlay" color="black" opacity="0.9">
          <div class="avatar-editor">
            <clipper-fixed
              ref="avatarClipper"
              :grid="false"
              :area="100"
              :src="avatar.new"
              bg-color="rgba(0, 0, 0, 0)"
              :round="true"
              shadow="rgba(0,0,0,0.5)"
              :rotate="avatar.rotation"
            >
            </clipper-fixed>

            <div class="px-4 py-4">
              <h6 class="caption pt-8">
                <v-icon>mdi-gesture-tap-hold</v-icon>
                Ajust the image by zooming, scaling and moving it around before
                saving.
              </h6>
              <h5 class="pt-8">rotate</h5>

              <clipper-range
                v-model="avatar.rotation"
                style="max-width:300px"
                :min="0"
                :max="360"
              ></clipper-range>
              <v-row class="actions py-6">
                <v-btn
                  @click="toggleUpdateAvatar(null)"
                  text
                  color="secondary"
                  class="mr-4"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-btn @click="handleImageUpload('avatar')" text color="blue">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </v-row>
            </div>
          </div>
        </v-overlay>
      </v-row>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar.vue'
const pick = require('lodash.pick')

export default {
  name: 'ProfileFormHeader',
  props: {
    id: String,
    preferredName: String,
    avatarImage: Object,
    headerImage: Object,

    addImages: Function
  },
  data () {
    return {
      avatar: {
        new: null,
        overlay: false,
        rotation: 0
      },
      header: {
        new: null,
        overlay: false,
        rotation: 0
      }
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    toggleUpdateAvatar (file) {
      this.avatar.new = this.avatar.new ? null : file
      this.avatar.overlay = !this.avatar.overlay
      this.header.new = null
    },
    toggleUpdateHeader (file) {
      this.header.new = this.header.new ? null : file
      this.header.overlay = !this.header.overlay
      this.avatar.new = null
    },
    async handleImageUpload (type) {
      try {
        const canvas = this.$refs[type + 'Clipper'].clip({ maxWPixel: 1920 })
        canvas.toBlob(async blob => {
          const file = new File([blob], type, { type: blob.type })

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
          this.addImages({
            [type + 'Image']: pick(result.data.uploadFile, [
              'blob',
              'mimeType',
              'uri'
            ])
          })
          this[type].new = null
          this[type].overlay = false
        })
      } catch (error) {
        throw error
      }
    }
  },
  components: {
    Avatar
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$avatarSize: 18vh;
$headerHeight: 100vw / 5.33333;
$formWidth: 600px;

.desktop {
  .header {
    max-width: 100%;
    height: $headerHeight;
    // @media
  }

  .header-row {
    background-color: white;
    .header-image {
      background: linear-gradient(
          45deg,
          hsl(0, 6%, 37.1%) 12%,
          transparent 0,
          transparent 88%,
          hsl(0, 6%, 37.1%) 0
        ),
        linear-gradient(
          135deg,
          transparent 37%,
          hsl(13.5, 4%, 31%) 0,
          hsl(13.5, 4%, 31%) 63%,
          transparent 0
        ),
        linear-gradient(
          45deg,
          transparent 37%,
          hsl(0, 6%, 37.1%) 0,
          hsl(0, 6%, 37.1%) 63%,
          transparent 0
        ),
        hsl(0, 5.2%, 27.6%);
      height: $headerHeight;
      width: 100%;
      opacity: 0.6;
    }

    .header-editor {
      width: 100vw;
      height: $headerHeight;
      margin-bottom: -1vw;
      .controls {
        position: absolute;
        top: $headerHeight;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
      }
    }
    .edit-header-button {
      cursor: pointer;
      position: absolute;
      top: calc(#{-$headerHeight/3} + #{$headerHeight});
      right: 5vw;
    }
  }

  .avatar-row {
    position: relative;
    min-width: $formWidth;
    max-width: 60vw;

    margin: 0 auto;
    // this seems like a bad way to be doing alignment here

    .avatar-box {
      position: absolute;
      top: -$avatarSize/2;
      left: -$avatarSize/4;

      margin-bottom: -$avatarSize;
      width: $avatarSize;
      height: $avatarSize;

      .avatar-picker {
        z-index: 1;

        background: rgba(100, 100, 100, 0.8);

        width: $avatarSize;
        border-radius: $avatarSize/2;
        margin-bottom: -$avatarSize;

        display: flex;
        flex-flow: column;
        align-content: center;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .avatar-editor {
    position: absolute;
    height: auto;
    min-width: $avatarSize;
    top: -2 * $avatarSize;
    right: $avatarSize/2;
  }
}

.mobile {
  $avatarSize: 25vh;

  .avatar-row {
    display: block;
    width: $avatarSize;
    height: $avatarSize;
    border-radius: $avatarSize/2;
    margin: 0 auto;

    .avatar-box {
      width: $avatarSize;
      height: $avatarSize;

      .avatar-picker {
        z-index: 1;

        background: rgba(100, 100, 100, 0.8);

        width: $avatarSize;
        height: $avatarSize;
        border-radius: $avatarSize/2;
        margin-bottom: -$avatarSize;

        display: flex;
        flex-flow: column;
        align-content: center;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.toggle {
  cursor: pointer;
  z-index: 999;
}
.actions {
  // position: relative;
  // top: -5vh;
  // left: -3vw;
  // left: 0;
  // z-index: 999;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  width: $formWidth/2;
}
</style>
