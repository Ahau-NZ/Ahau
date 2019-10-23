<template>
  <div>
    <ProfileHeader :id="id" :edit="true"/>
    <ProfileInfoEdit :id="id" :edit="true"/>
  </div>
</template>

<script>
import ProfileHeader from '@/components/ProfileHeader.vue'
import ProfileInfoEdit from '@/components/ProfileInfoEdit.vue'

export default {
  name: 'Edit',
  data () {
    return {
      id: this.$route.params.id
    }
  },
  components: {
    ProfileHeader,
    ProfileInfoEdit
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
