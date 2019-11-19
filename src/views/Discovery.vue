<template>
  <div class="wrapper">
    <v-container class="white mx-auto py-2 px-12 d-flex flex-column justify-space-between align-center">
      <!-- <CommunitiesNav /> -->
      <CommunitiesPeople />
      <CommunitiesList />
    </v-container>
  </div>
</template>

<script>
// import CommunitiesNav from '@/components/CommunitiesNav'
import CommunitiesPeople from '@/components/CommunitiesPeople'
import CommunitiesList from '@/components/CommunitiesList'

export default {
  name: 'Discovery',
  components: {
    // CommunitiesNav,
    CommunitiesPeople,
    CommunitiesList
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .wrapper {
    background-color: white;
    width: 100%;
    height: 100%;
  }
</style>
