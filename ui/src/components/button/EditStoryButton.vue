<template>
  <v-btn  @click="toggle()" class="pr-0" text color="#157ed2">
    Update record
    <v-icon class="ml-3" color="#157ed2">mdi-file-document-edit-outline</v-icon>
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
