<template>
  <v-container class="white mx-auto py-2 px-12 d-flex flex-column justify-space-between align-center">
    <CommunitiesNav v-bind:nav="navigate" />
    <CommunitiesPeople />
    <CommunitiesList />
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
  methods () {
    return {
      navigate: (e) => console.log('Changed', e)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
