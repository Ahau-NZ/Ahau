<template>
  <v-container class="my-0 py-0">
    <v-row>
      <v-img v-if="!updatingHeader" :src="profile.headerImage ? profile.headerImage.uri : ''" min-width="100%" height="35vh"/>
      <v-btn v-if="edit && !updatingHeader" class="edit-header-button" tile color="grey" @click="toggleUpdateHeader">
        <v-icon>mdi-pencil</v-icon> Edit header
      </v-btn>
    </v-row>
    <div v-if="edit && updatingHeader" class="header-edit">
      <v-image-input
        class="super-z"
        fullWidth
        imageHeight=256
        imageWidth=800
        v-model="newHeader"
        :image-quality="0.85"
        clearable
        image-format="jpeg"
      />
      <div class="handle-header-buttons">
        <v-btn
          :disabled="!newHeader"
          color="success"
          @click="handleHeaderImage"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn
          color="error"
          class="mr-4"
          @click="toggleUpdateHeader"
        >
          <v-icon>mdi-cancel</v-icon>
        </v-btn>
      </div>
    </div>
    <v-row class="avatar">
      <Avatar v-if="!updatingAvatar" :image="profile.avatarImage ? profile.avatarImage.uri : ''" :alt="profile.preferredName" />
      <div v-if="edit && !updatingAvatar">
        <v-btn v-if="edit && !updatingAvatar" class="edit-avatar-button" fab color="grey" @click="toggleUpdateAvatar">
          <v-icon>mdi-camera</v-icon>
        </v-btn>
      </div>
    </v-row>
    <v-row v-if="edit && updatingAvatar" >
      <div class="avatar-edit">
        <v-image-input
          class="super-z va"
          v-model="newAvatar"
          :image-quality="0.85"
          clearable
          image-format="jpeg"
          backgroundColor="black"
        />
        <div class="handle-avatar-buttons">
          <v-btn
            :disabled="!newAvatar"
            color="success"
            @click="handleAvatarImage"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn
            color="error"
            class="mr-4"
            @click="toggleUpdateAvatar"
          >
            <v-icon>mdi-cancel</v-icon>
          </v-btn>
        </div>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar.vue'

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

export default {
  name: 'ProfileHeader',
  props: {
    edit: Boolean,
    id: String,
    addToForm: Function
  },
  components: {
    Avatar
  },
  data () {
    return {
      updatingHeader: false,
      newHeader: null,
      updatingAvatar: false,
      newAvatar: null,
      profile: {
        preferredName: '',
        avatarImage: null,
        headerImage: null
      }
    }
  },
  apollo: {
    profile: {
      query: gql`query($id: String!) {
        profile(id: $id) {
          preferredName
          avatarImage {
            uri
          }
          headerImage {
            uri
          }
        }
      }`,
      variables () {
        return {
          id: this.id
        }
      }
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
      const file = dataURLtoFile(this.newAvatar, 'avatar.jpg')
      const result = await this.$apollo.mutate({
        mutation: gql`mutation uploadFile($file: Upload!) {
          uploadFile(file: $file) {
            blob
            mimeType
            size
            uri
          }
        }`,
        variables: {
          file
        }
      })
      this.profile.avatarImage = result.data.uploadFile
      this.addToForm('avatarImage', result.data.uploadFile)
      this.newAvatar = null
      this.updatingAvatar = null
    },
    async handleHeaderImage () {
      const file = dataURLtoFile(this.newHeader, 'header.jpg')
      const result = await this.$apollo.mutate({
        mutation: gql`mutation uploadFile($file: Upload!) {
          uploadFile(file: $file) {
            blob
            mimeType
            size
            uri
          }
        }`,
        variables: {
          file
        }
      })
      this.profile.headerImage = result.data.uploadFile
      this.addToForm('headerImage', result.data.uploadFile)
      this.newHeader = null
      this.updatingHeader = null
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .super-z {
    z-index: 998;
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
    top: 30vh;
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
    margin-bottom: -25vh;
    width: 25vh;
  }
  .avatar-edit {
    position: relative;
    top: 5vh;
    background: rgba(0,0,0,.6);
    height: 435px;
    margin-bottom: -25vh;
    z-index: 998;
    padding: 50px;
  }
  .edit-avatar-button {
    cursor: pointer;
    position: absolute;
    top: 17vh;
    left: 1vw;
    z-index: 999;
  }
  .handle-avatar-buttons {
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
