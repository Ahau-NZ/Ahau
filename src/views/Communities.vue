<template>
  <v-container class="white mx-auto py-2 px-12 d-flex flex-column justify-space-between align-center">
    <CommunitiesNav />
    <CommunitiesPeople />
    <CommunitiesList />
    <h1>{{nav}}</h1>
  </v-container>
</template>

<script>
import CommunitiesNav from '@/components/CommunitiesNav'
import CommunitiesPeople from '@/components/CommunitiesPeople'
import CommunitiesList from '@/components/CommunitiesList'

export default {
  name: 'Commmunities',
  components: {
    CommunitiesNav,
    CommunitiesPeople,
    CommunitiesList
  },
  computed: {
    nav () {
      // We will see what `params` is shortly
      console.log(this.$route.params)
      return this.$route.params
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
