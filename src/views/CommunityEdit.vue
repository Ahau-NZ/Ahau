<template>
  <ProfileForm :id="id" type="community"/>
</template>

<script>
import ProfileForm from '@/components/ProfileForm'

export default {
  name: 'CommunityEdit',
  data () {
    return { id: this.$route.params.id }
  },
  components: {
    ProfileForm
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .form {
    min-width: 600px;
    max-width: 60vw;
    margin: 0 auto;
  }
</style>
