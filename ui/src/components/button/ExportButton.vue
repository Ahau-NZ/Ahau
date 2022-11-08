<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on" @click="toggle()" fab x-small color="#2f4f4f">
           <v-icon light > mdi-download-circle </v-icon>
        </v-btn>
    </template>
    <span>{{ alt }}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'ExportButton',
  props: {
    alt: {
      type: String,
      default: 'Export'
    }
  },
  methods: {
    toggle () {
      this.$emit('export')
    }
  }
}
</script>
