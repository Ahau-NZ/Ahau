<template>
  <v-container class="full-width my-0 py-0 px-0">
    <v-parallax class="header-bg py-0 px-0" :src="headerImage.uri" :height="headerHeight" >
      <ImagePicker class="edit-header pb-2 " label=" " type="header" :isView="true" @updateAvatar="updateHeader($event)" :avatarLoaded="headerImage"/> 
    </v-parallax>
  </v-container>
</template>

<script>
import ImagePicker from '@/components/ImagePicker.vue'
import { mapGetters } from 'vuex'
import gql from 'graphql-tag'

export default {
  name: 'ProfileHeader',
  props: {
    headerImage: {type: Object, default: {uri:require('@/assets/nzheader.jpg')}},
    headerHeight: String
  },
  computed: {
    ...mapGetters(['selectedProfile']),
    // headerPic () {
    //   if (this.headerImage) return this.headerImage.uri
    //   else return require('@/assets/nzheader.jpg')
    // }
  },
  methods : {
    async updateHeader (image) {
      console.log("new header :", image)
      const res =  await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.selectedProfile.id,
            headerImage : image
          }
        }
      })
      console.log("res: ", res)
      if (res.errors) {
        console.error('failed to update header photo', res)
        return
      }   
      if (res.data) {
        console.log("return: ", res.data)
        // this.$emit('setupProfile', res.data.saveProfile)
        // return
        this.$emit('setupProfile', this.selectedProfile.id)
      }
    }
  },
  components: {
    ImagePicker
  }
}
</script>
<style scoped lang="scss">
.full-width {
  max-width: 100%;
}
.edit-header {
  position: absolute;
  right:20px;
  bottom: 0;
  cursor: pointer;
  text-decoration-color: white;
}

.header-bg {
  // height: 200px;
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
  /* background-size: 50px 50px; */
  background-size: cover;
}

</style>
