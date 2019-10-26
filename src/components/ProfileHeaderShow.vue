<template>
  <v-container class="my-0 py-0">
    <v-row>
      <v-img :src="headerImage ? headerImage.uri : ''" min-width="100%" height="35vh"/>
    </v-row>

    <v-row class="avatar">
      <Avatar :image="avatarImage" :alt="preferredName" />
    </v-row>
  </v-container>
</template>

<script>
import Avatar from '@/components/Avatar.vue'

export default {
  name: 'ProfileHeaderShow',
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
  .avatar {
    position: relative;
    top: -18.75vh;
    margin-bottom: -25vh;
    width: 25vh;
  }
</style>
