<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab x-small color="#2f4f4f">
           <v-icon light > mdi-download-circle </v-icon>
        </v-btn>
    </template>
    <span>Export to csv</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'ExportButton',
  methods: {
    toggle () {
      this.$emit('export')
    }
  }
}
</script>
