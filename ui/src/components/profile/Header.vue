<template>
  <v-container class="full-width my-0 py-0">
    <v-row :justify="mobile ? 'center' : 'start'" class="header-bg flex-columns" v-bind:style="{ backgroundImage: 'url(' + require('@/assets/nzheader.jpg') +')', height: headerHeight }">
      <!-- <v-img :src="headerImage ? headerImage.uri : require('@/assets/nzheader.jpg')" min-width="100%" /> -->
      <Avatar :class="mobile ? 'avatar-mobile' : 'avatar-desktop'" :image="avatarImage" :alt="preferredName" :size="size" />
    </v-row>
  </v-container>
</template>

<script>
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'ProfileHeader',
  props: {
    preferredName: String,
    headerImage: Object,
    avatarImage: Object,
    headerHeight: String
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    small () {
      return this.$vuetify.breakpoint.sm
    },
    size () {
      if (this.small) {
        return '150'
      }
      return '200'
    }
  },
  components: {
    Avatar
  }
}
</script>
<style scoped lang="scss">
$avatarSize: 25vh;
$ratio: 5.33333;
$headerHeight: 100vw / $ratio;
$maxHeaderWidth: 1400px;
$formWidth: 600px;
.full-width {
  max-width: 100%;
  // @media screen and (min-width: $maxHeaderWidth) {
  //   width: $maxHeaderWidth;
  //   height: $maxHeaderWidth / $ratio;
  // }
}
.header-bg {
  height: 250px;
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

.avatar-row {
  position: relative;
  width: 100%;
  /* height: 20%; */
  margin: auto;

  .avatar-box {
    position: absolute;
    /* left: calc(-100vw / 3 + 3 * #{$avatarSize}); */
    top: -$avatarSize/1.5;
    width: 100%;
  }
}

.avatar-mobile {
  margin-top: 5vw;
}

.avatar-desktop {
  margin-top: 7vw;
  margin-left: 1vw
}

.avatar {
  margin-top: 100px;
  margin-left: 100px;
}
</style>
