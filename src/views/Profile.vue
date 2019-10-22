<template>
  <div>
    <ProfileHeader v-bind:id="this.$route.query.id" />
    <ProfileInfo v-bind:id="this.$route.query.id"  />
  </div>
</template>

<script>
import ProfileHeader from '@/components/ProfileHeader.vue'
import ProfileInfo from '@/components/ProfileInfo.vue'

export default {
  name: 'Profile',
  components: {
    ProfileHeader,
    ProfileInfo
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
