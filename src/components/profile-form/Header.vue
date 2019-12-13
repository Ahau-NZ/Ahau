<template>
  <v-container class="full-width my-0 py-0">
    <v-row class="header-bg">
      <v-img v-if="!header.new" :src="headerImage ? headerImage.uri : ''" min-width="100%" />
      <div v-if="header.overlay" class="header-editor">
        <clipper-fixed
          ref="headerClipper"
          :min-scale="0.5"
          :grid="true"
          :ratio="16/3"
          :area="100"
          :src="header.new"
          border-color="black"
          bg-color="rgba(0, 0, 0, 0)"
          :round="false"
          shadow="rgba(0,0,0,0.5)"
          :rotate="header.rotation"
        ></clipper-fixed>
        <div class="controls px-8 py-4">
          <h5>rotate</h5>
          <clipper-range v-model="header.rotation" style="max-width:300px" :min="0" :max="360"></clipper-range>
          <v-row class="actions py-6">
            <v-btn @click="toggleUpdateHeader(null)" text color="secondary" class="mr-4" >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-btn @click="handleImageUpload('header')" text color="secondary" >
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-row>
        </div>
      </div>
      <clipperUpload v-if="!header.new" @input="toggleUpdateHeader" accept="image/*" class="edit-header-button">
        <v-btn fab color="white">
          <v-icon class="black--text">mdi-pencil</v-icon>
        </v-btn>
        <span class="white--text pl-4 title">Upload header photo</span>
      </clipperUpload>
    </v-row>

    <v-row class="avatar-row">
      <v-row class="avatar-box">
        <clipperUpload class="avatar-picker" accept="image/*" @input="toggleUpdateAvatar">
          <v-btn v-if="!avatar.new" class="toggle" fab color="white">
            <v-icon class="black--text">mdi-camera</v-icon>
          </v-btn>
          <span class="caption pt-4">Upload profile photo</span>
        </clipperUpload>
        <Avatar v-if="!avatar.new" :image="avatarImage" :alt="preferredName" />
        <v-overlay :value="avatar.overlay" color="black" opacity="0.9">
          <div class="avatar-editor">
            <clipper-fixed
              ref="avatarClipper"
              :grid="false"
              :src="avatar.new"
              bg-color="rgba(0, 0, 0, 0)"
              :round="true"
              shadow="rgba(0,0,0,0.5)"
              :rotate="avatar.rotation">
            </clipper-fixed>
            <div class="px-8 py-4">
              <h5>rotate</h5>
              <clipper-range v-model="avatar.rotation" style="max-width:300px" :min="0" :max="360"></clipper-range>
              <v-row class="actions py-6">
                <v-btn @click="toggleUpdateAvatar(null)" text color="secondary" class="mr-4" >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-btn @click="handleImageUpload('avatar')" text color="secondary" >
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
import { clipperUpload, clipperFixed } from 'vuejs-clipper'
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
          const file = await blob2file(URL.createObjectURL(blob), type)
          const result = await this.$apollo.mutate({
            mutation: gql`mutation uploadFile($file: Upload!) {
              uploadFile(file: $file) {
                blob
                mimeType
                uri
              }
            }`,
            variables: {
              file
            }
          })
          if (result.errors) throw result.errors
          this.addImages({
            [type + 'Image']: pick(result.data.uploadFile, ['blob', 'mimeType', 'uri'])
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
    Avatar,
    clipperUpload,
    clipperFixed
  }
}

async function blob2file (blobUrl, name) {
  let file = await fetch(blobUrl)
    .then(r => r.blob())
    .then(blobFile => new File([blobFile], name || 'file', { type: 'image/jpg' }))
  return file
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .full-width {
    max-width: 100%
  }
  .super-z {
    z-index: 998;
  }
  .header-bg {
    background: linear-gradient(45deg, hsl(0, 6%, 37.1%) 12%, transparent 0, transparent 88%, hsl(0, 6%, 37.1%) 0), linear-gradient(135deg, transparent 37%, hsl(13.5, 4%, 31%) 0, hsl(13.5, 4%, 31%) 63%, transparent 0), linear-gradient(45deg, transparent 37%, hsl(0, 6%, 37.1%) 0, hsl(0, 6%, 37.1%) 63%, transparent 0), hsl(0, 5.2%, 27.6%);
    background-size: 50px 50px;
  }
  .header {
    height: calc(100vw / 5.33333);
    background: grey;
    width: 100%;
    margin-bottom: calc(-100vw / 5.33333);
    position: relative;
    top: calc(-100vw / 5.33333);
    opacity: 0.6;
  }
  .header-editor {
    width: 100vw;
    height: calc(100vw / 5.33333);
    margin-bottom: -1vw;
    .controls {
      position: absolute;
      top: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.8);
    }
  }
  .edit-header-button {
    cursor: pointer;
    position: absolute;
    top: 27vh;
    right: 5vw;
  }
  .handle-header-buttons {
    position: relative;
    top: -15vh;
    right: -55%;
    z-index: 999;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    width: 300px;
  }

  .avatar-row {
    position: relative;
    min-width: 600px;
    max-width: 60vw;

    margin: 0 auto;
    // this seems like a bad way to be doing alignment here

    .avatar-box {
      position: absolute;
      top: -18.75vh;
      left: -5vh;

      margin-bottom: -25vh;
      width: 25vh;

      .avatar-picker {
        z-index: 1;

        background: rgba(100,100,100,0.8);

        width: 25vh;
        border-radius: 12.5vh;
        margin-bottom: -25vh;

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
    // background: rgba(0,0,0,.8);
    height: auto;
    min-width: 610px;
    z-index: 999;
    top: -45vh;
    right: 5vw;
  }

.toggle {
  cursor: pointer;
  z-index: 999;
}
.editor {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  height: 460px;
  width: 610px;
  z-index: 998;
  padding: 50px;
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
  width: 300px;
}
</style>
