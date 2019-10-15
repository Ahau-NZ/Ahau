<template>
  <div class="wrapper">
    <ProfileHeader />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import ProfileHeader from '@/components/ProfileHeader.vue'

export default {
  name: 'Profile',
  components: {
    ProfileHeader,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
