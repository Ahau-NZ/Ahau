<template>
  <v-btn dark @click="toggle()" class="pr-0" text color="#157ed2">
    Edit artefact
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
