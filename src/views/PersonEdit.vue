<template>
  <ProfileForm :id="id" type="person"/>
</template>

<script>
import ProfileForm from '@/components/ProfileForm'

export default {
  name: 'PersonEdit',
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
