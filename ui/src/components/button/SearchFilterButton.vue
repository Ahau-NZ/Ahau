<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click.stop="$emit('update:searchFilter', true)" fab x-small color="#12355b">
          <v-icon> mdi-filter </v-icon>
        </v-btn>
    </template>
    <span>Filter on Name</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'SearchFilterButton',
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
