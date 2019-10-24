<template>
  <div>
    <ProfileHeader :id="id"/>
    <ProfileInfo :id="id"/>
  </div>
</template>

<script>
import ProfileHeader from '@/components/ProfileHeader.vue'
import ProfileInfo from '@/components/ProfileInfo.vue'

export default {
  name: 'ProfileShow',
  computed: {
    id () {
      return this.$route.params.id
    }
  },
  components: {
    ProfileHeader,
    ProfileInfo
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
