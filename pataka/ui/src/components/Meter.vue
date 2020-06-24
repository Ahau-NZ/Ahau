<template>
  <v-card class="mt-4" max-width="400">
    <v-sheet class="v-sheet--offset mx-auto" color="primary" tile>
      <v-card-text class="pt-0">
        <div class="title font-weight-light mb-2">{{title}}</div>
      </v-card-text>
      <v-sparkline :labels="labels" :value="values" color="cyan" line-width="2" padding="16"></v-sparkline>
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
</style>
