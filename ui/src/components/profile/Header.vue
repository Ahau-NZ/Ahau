<template>
  <v-container class="header-bg full-width my-0 py-0 px-0" :class="headerHeight" v-bind:style="{ backgroundImage: 'url(' + headerImage +')', height: headerHeight + 'px'}">
    <v-row>
      <v-col v-if="mobile" class="mt-12">
        <Avatar class="avatar-mobile" :image="profile.avatarImage" :alt="profile.preferredName" size="180" :isView="profile.type === 'community' && !profile.avatarImage" :gender="profile.gender" :aliveInterval="profile.aliveInterval"/>
      </v-col>
      <v-col v-if="profile.canEdit">
        <ImagePicker class="picker" label=" " type="header" :isView="true" @updateAvatar="updateHeader($event)" :avatarLoaded="headerImage"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ImagePicker from '@/components/ImagePicker.vue'
import Avatar from '@/components/Avatar.vue'

import gql from 'graphql-tag'

export default {
  name: 'Header',
  props: {
    profile: Object,
    canEdit: Boolean
  },
  components: {
    ImagePicker,
    Avatar
  },
  methods: {
    async updateHeader (image) {
      delete image.uri

      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.profile.id,
            headerImage: image
          }
        }
      })
      if (res.errors) {
        console.error('failed to update header photo', res)
        return
      }
      if (res.data) {
        // this.$emit('setupProfile', this.profile.id)
        this.$parent.$apollo.queries.profile.refetch({ id: this.profile.id })
      }
    }
  },
  computed: {
    headerImage () {
      if (this.profile.headerImage) return this.profile.headerImage.uri
      else return require('@/assets/nzheader.jpg')
    },
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    size () {
      if (this.small) {
        return '100'
      }
      return '200'
    },

    headerHeight () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return '200'
        case 'sm': return '200'
        case 'md': return '250'
        case 'lg': return '300'
        case 'xl': return '300'
        default:
          return '300'
      }
    }
  }
}
</script>
<style scoped lang="scss">
.full-width {
  max-width: 100%;
}

.header-bg {
  position: relative;
  height: 200px;
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
  background-position: center;
  // background-attachment: fixed;
}

.picker {
  position: absolute;
  right: 30px;
  bottom: 20px;
  cursor: pointer;
}

.header-mobile {
  cursor: pointer;
  text-decoration-color: white;
  margin-left: 90vw;
}

.avatar-mobile {
  margin-left: 40vw;
  margin-right: 40vw;
}

</style>
