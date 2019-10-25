<template>
  <CommunityForm :id="id" />
</template>

<script>
import CommunityForm from '@/components/CommunityForm'

export default {
  name: 'CommunityEdit',
  data () {
    return { id: this.$route.params.id }
  },
  components: {
    CommunityForm
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
