<template>
  <div>
    <ProfileHeader v-bind:edit="true" />
    <ProfileInfoEdit v-bind:edit="true" />
  </div>
</template>

<script>
import ProfileHeader from '@/components/ProfileHeader.vue'
import ProfileInfoEdit from '@/components/ProfileInfoEdit.vue'

export default {
  name: 'Edit',
  components: {
    ProfileHeader,
    ProfileInfoEdit
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
