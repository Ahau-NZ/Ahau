<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="$emit('sort', $event)" fab x-small color="#12355b">
          <v-icon> mdi-sort </v-icon>
        </v-btn>
    </template>
    <span>Sort</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'SortButton',
  data () {
    return {
      sortOptions: ['Option 1', 'Option 2']
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
