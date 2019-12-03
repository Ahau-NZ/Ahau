<template>
  <ProfileShow :profileId="id" type="community" />
</template>

<script>
import ProfileShow from '@/components/ProfileShow'

export default {
  name: 'CommmunityShow',
  data () {
    return {
      id: this.$route.params.id
    }
  },
  components: {
    ProfileShow
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
</style>
