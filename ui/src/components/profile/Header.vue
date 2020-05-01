<template>
  <v-container class="full-width my-0 py-0">
    <v-row class="header-bg" v-bind:style="{ backgroundImage: 'url(' + require('@/assets/nzheader.jpg') +')', height: headerHeight }">
      <!-- <v-img :src="headerImage ? headerImage.uri : require('@/assets/nzheader.jpg')" min-width="100%" /> -->
    </v-row>

    <!-- <v-row class="avatar-row">
      <v-row class="avatar-box">
          <Avatar :image="avatarImage" :alt="preferredName" size="25vh" />
      </v-row>
    </v-row> -->
    
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
  /* width: $formWidth; */
  width: 100%;
  max-width: 60vw;

  margin: auto;
  // this seems like a bad way to be doing alignment here

  .avatar-box {
    position: absolute;
    top: -$avatarSize/1.5;
    // Not sure how to calculate this
    left: calc(-100vw / 3 + 2 * #{$avatarSize});

    margin-bottom: -$avatarSize;
    width: $avatarSize;
  }
}
</style>
