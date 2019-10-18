<template>
  <v-container class="white py-4 d-flex flex-column align-self-start">
    <v-row class="py-2">
      <h2 class="grey--text subtitle-1">Communities</h2>
    </v-row>
    <v-row class="d-flex flex-column align-center">
      <v-col>
        <v-card
          light
          height="350px"
          width="250px"
        >
          <v-img height="100px" v-bind:src="image" />
          <v-card-title class="headline font-weight-bold">{{name}}</v-card-title>
          <v-card-text>{{description}}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'CommunitiesList',
  data () {
    return {
      name: 'Ngati Tai-a-rae-ke',
      description: 'Description for the community',
      image: 'http'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
