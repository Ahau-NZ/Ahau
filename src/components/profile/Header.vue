<template>
  <v-container class="full-width my-0 py-0">
    <v-row class="header-bg">
      <v-img :src="headerImage ? headerImage.uri : ''" min-width="100%" height="35vh"/>
    </v-row>

    <v-row class='avatar-row'>
      <v-row class='avatar-box'>
        <Avatar :image="avatarImage" :alt="preferredName" />
      </v-row>
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
    avatarImage: Object
  },
  components: {
    Avatar
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .full-width {
    max-width: 100%
  }
  .header-bg {
    background: linear-gradient(45deg, hsl(0, 6%, 37.1%) 12%, transparent 0, transparent 88%, hsl(0, 6%, 37.1%) 0), linear-gradient(135deg, transparent 37%, hsl(13.5, 4%, 31%) 0, hsl(13.5, 4%, 31%) 63%, transparent 0), linear-gradient(45deg, transparent 37%, hsl(0, 6%, 37.1%) 0, hsl(0, 6%, 37.1%) 63%, transparent 0), hsl(0, 5.2%, 27.6%);
    background-size: 50px 50px;
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
    }
  }
</style>
