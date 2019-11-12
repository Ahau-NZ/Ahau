<template>
  <v-container class="full-width my-0 py-0">
    <v-row v-if="!updatingHeader" class="header-bg">
      <v-img :src="headerImage ? headerImage.uri : ''" min-width="100%" height="35vh"/>
      <div class="header"></div>
      <div @click="toggleUpdateHeader" class="edit-header">
        <v-btn fab color="white">
          <v-icon class="black--text">mdi-pencil</v-icon>
        </v-btn>
        <span class="white--text pl-4 title">Upload header photo</span>
      </div>
    </v-row>
    <v-row v-if="updatingHeader" class="header-edit">
      <v-image-input
        v-model="newHeader"
        :image-quality="0.85"
        class="super-z"
        fullWidth
        imageHeight=256
        imageWidth=800
        clearable
        image-format="jpeg"
      />
      <div class="handle-header-buttons">
        <v-btn @click="toggleUpdateHeader" color="error" class="mr-4" >
          <v-icon>mdi-cancel</v-icon>
        </v-btn>
        <v-btn @click="handleHeaderImage" :disabled="!newHeader" color="success">
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </div>
    </v-row>

    <v-row class="avatar">
      <Avatar :image="avatarImage" :alt="preferredName" />
      <div class="avatar-image">
        <v-btn v-if="!updatingAvatar" class="toggle" fab color="white" @click="toggleUpdateAvatar">
          <v-icon class="black--text">mdi-camera</v-icon>
        </v-btn>
        <span class="caption pt-4">Upload profile photo</span>
      </div>
      <v-container v-if="updatingAvatar" class="editor">
        <v-image-input
          v-model="newAvatar"
          :image-quality="0.85"
          class="super-z va"
          clearable
          image-format="jpeg"
          backgroundColor="black"
        />
        <v-row class="actions">
          <v-btn @click="toggleUpdateAvatar" outlined color="grey" class="mr-4" >
            <v-icon>mdi-cancel</v-icon>
          </v-btn>
          <v-btn @click="handleAvatarImage" :disabled="!newAvatar" color="success" >
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-row>
      </v-container>
    </v-row>

  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar.vue'
const pick = require('lodash.pick')

export default {
  name: 'ProfileHeaderEdit',
  props: {
    id: String,
    preferredName: String,
    avatarImage: Object,
    headerImage: Object,

    addImages: Function
  },
  data () {
    return {
      updatingHeader: false,
      newHeader: null,
      updatingAvatar: false,
      newAvatar: null
    }
  },
  methods: {
    toggleUpdateAvatar () {
      this.updatingAvatar = !this.updatingAvatar
      this.updatingHeader = false
    },
    toggleUpdateHeader () {
      this.updatingHeader = !this.updatingHeader
      this.updatingAvatar = false
    },
    async handleAvatarImage () {
      const result = await this.$apollo.mutate({
        mutation: gql`mutation uploadFile($file: Upload!) {
          uploadFile(file: $file) {
            blob
            mimeType
            uri
          }
        }`,
        variables: {
          file: dataURLtoFile(this.newAvatar, 'avatar.jpg')
        }
      })
      if (result.errors) throw result.errors

      this.addImages({
        avatarImage: pick(result.data.uploadFile, ['blob', 'mimeType', 'uri'])
      })
      this.updatingAvatar = false
      this.newAvatar = null
    },
    async handleHeaderImage () {
      const result = await this.$apollo.mutate({
        mutation: gql`mutation uploadFile($file: Upload!) {
          uploadFile(file: $file) {
            blob
            mimeType
            uri
          }
        }`,
        variables: {
          file: dataURLtoFile(this.newHeader, 'header.jpg')
        }
      })
      if (result.errors) throw result.errors

      this.addImages({
        headerImage: pick(result.data.uploadFile, ['blob', 'mimeType', 'uri'])
      })
      this.updatingHeader = false
      this.newHeader = null
    }
  },
  components: {
    Avatar
  }
}

function dataURLtoFile (dataurl, filename) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
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
    min-height: 35vh;
    background: grey;
    width: 100%;
    margin-bottom: -35vh;
    position: relative;
    top: -35vh;
    opacity: 0.6;
  }
  .header-edit {
    height: 64vh;
    margin-bottom: calc(35vh - 64vh);
    background: rgba(0,0,0,.6);
    z-index: 999;
  }
  .edit-header-button {
    cursor: pointer;
    position: absolute;
    top: 27vh;
    right: 5vw;
    z-index: 999;
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
  .avatar {
    position: relative;
    top: -18.75vh;
    left: calc(50% - 400px - 64px);
    margin-bottom: -25vh;
    width: 25vh;
  }
  .avatar-image {
    width: 25vh;
    margin-bottom: -25vh;
    background: rgba(100,100,100,0.8);
    position: relative;
    top: -25vh;
    border-radius: 12.5vh;
    display: flex;
    flex-flow: column;
    align-content: center;
    align-items: center;
    justify-content: center;
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
  position: relative;
  top: -5vh;
  left: -3vw;
  left: 0;
  z-index: 999;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  width: 300px;
}
</style>
