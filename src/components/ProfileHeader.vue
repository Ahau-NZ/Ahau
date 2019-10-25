<template>
  <v-container class="my-0 py-0">
    <v-row>
      <v-img :src="profile.headerImage ? profile.headerImage.uri : ''" min-width="100%" height="35vh"/>
      <v-btn v-if="edit" class="edit-header" tile color="grey">
        <v-icon>mdi-pencil</v-icon> Edit header
      </v-btn>
    </v-row>
    <v-row class="avatar">
      <div v-if="edit">
        <v-image-input
          v-model="newAvatar"
          :image-quality="0.85"
          clearable
          image-format="jpeg"
        />
        <v-btn
          :disabled="!newAvatar"
          color="success"
          class="handle-avatar-button"
          @click="handleAvatarImage"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </div>
      <Avatar :image="profile.avatarImage ? profile.avatarImage.uri : ''" :alt="profile.preferredName" />
      <!-- <div v-if="edit && !newAvatar">
        <input v-if="edit" @change="handleAvatarImage" type="file" />
        <v-btn v-if="edit" class="edit-avatar" fab color="grey">
          <v-icon>mdi-camera</v-icon>
        </v-btn>
      </div> -->
    </v-row>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'ProfileHeader',
  props: {
    edit: Boolean,
    id: String
  },
  components: {
    Avatar
  },
  data () {
    return {
      newAvatar: null,
      profile: {
        preferredName: '',
        avatarImage: {
          uri: ''
        },
        headerImage: {
          uri: ''
        }
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
    async handleAvatarImage () {
      const file = this.newAvatar // TODO convert base64 to File
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .avatar {
    position: relative;
    top: -18.75vh;
    // left: 5vw;
    margin-bottom: -25vh;
  }
  .edit-header {
    cursor: pointer;
    position: absolute;
    top: 30vh;
    right: 5vw;
  }
  .edit-avatar {
    cursor: pointer;
    position: absolute;
    top: 17vh;
    left: 1vw;
    z-index: 999;
  }
  .handle-avatar-button {
    position: relative;
    top: -3vh;
    left: -27vw;
  }
</style>
