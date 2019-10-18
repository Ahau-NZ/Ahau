<template>
  <v-container class="white py-4 d-flex flex-column align-start">
    <v-row class="py-2">
      <h2 class="grey--text subtitle-1">People</h2>
    </v-row>
    <v-row class="d-flex flex-column align-center">
      <Avatar image="https://" size="80" />
      <p class="black--text">{{preferredName}}</p>
    </v-row>
  </v-container>
</template>

<script>
import Avatar from '@/components/Avatar'
export default {
  name: 'CommunitiesPeople',
  components: {
    Avatar
  },
  data () {
    return {
      preferredName: 'Ben'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
