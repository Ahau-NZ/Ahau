<template>
  <ProfileForm type="community" />
</template>

<script>
import ProfileForm from '@/components/ProfileForm'

export default {
  name: 'CommunityNew',
  components: {
    ProfileForm
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .form {
    max-width: 600px;
    margin: 0 auto;
  }
</style>
