<template>
  <v-btn v-on="on" dark @click="toggle()" class="pr-0" text color="#b12526">
    Update artefact
    <v-icon class="ml-3">mdi-image-edit-outline</v-icon>
  </v-btn>
</template>
<script>
export default {
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs
    }
  },
  methods: {
    toggle () {
      this.$emit('click')
    }
  }
}
</script>
