<template>
  <v-card class="mt-4" max-width="400">
    <v-sheet class="v-sheet--offset mx-auto" color="primary" tile>
      <v-card-text class="pt-0">
        <v-row class="mt-2 ml-4" align="center">
          <h2>{{title}}</h2>
          <span class="pl-4 caption">usage on last hour</span>
        </v-row>
      </v-card-text>
      <v-sparkline :labels="labels" :value="values" color="cyan" line-width="1" padding="16"></v-sparkline>
    </v-sheet>
  </v-card>
</template>

<script>
export default {
  name: 'Meter',
  props: {
    title: String,
    labels: Array,
    values: Array
  }
}
</script>
<style scoped lang="scss">
h2 {
    font-size: 1.3em;
    text-transform: uppercase;
    font-weight: 400;
    letter-spacing: 4px;
}
</style>
