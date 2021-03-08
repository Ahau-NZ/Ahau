<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" @click.stop="$emit('update:search', true)" fab x-small color="#12355b">
        <v-icon >mdi-magnify</v-icon>
      </v-btn>
    </template>
    <span>Search</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'SearchButton',
  props: {
    search: Boolean
  }
}
</script>
