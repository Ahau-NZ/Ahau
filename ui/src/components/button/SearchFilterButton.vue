<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click.stop="$emit('searchFilter', $event)" fab x-small color="#12355b">
          <v-icon> mdi-filter </v-icon>
        </v-btn>
    </template>
    <span>SearchFilter</span>
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
