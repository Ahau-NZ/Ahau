<template>
  <v-container class="my-0 py-0">
    <v-row>
      <v-img :src="profile.headerImage || undefined" min-width="100%" height="35vh"/>
      <v-btn v-if="edit" class="edit-header" tile color="grey">
        <v-icon>mdi-pencil</v-icon> Edit header
      </v-btn>
    </v-row>
    <v-row class="avatar">
      <Avatar :image="profile.avatarImage" :alt="profile.preferredName" />
      <input @change="handleAvatarImage" type="file" />
      <v-btn v-if="edit" class="edit-avatar" fab color="grey">
        <v-icon>mdi-camera</v-icon>
      </v-btn>
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
      newAvatarImage: null,
      newHeaderImage: null,
      profile: {
        preferredName: '',
        avatarImage: '',
        headerImage: ''
      }
    }
  },
  apollo: {
    profile: {
      query: gql`query($id: String!) {
        profile(id: $id) {
          preferredName
          avatarImage
          headerImage
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
    async handleAvatarImage (e) {
      console.log('E', e.target.files[0])
      // this.newAvatarImage = e.target.value
      const result = await this.$apollo.mutate({
        mutation: gql`mutation uploadFile($file: Upload!) {
          uploadFile(file: $file)
        }`,
        variables: {
          file: e.target.files[0]
        }
      })
      console.log('RES', result)
      // if (result.data) this.goToShow()
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
</style>
