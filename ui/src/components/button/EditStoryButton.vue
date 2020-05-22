<template>
  <v-btn v-on="on"  @click="toggle()" class="pr-0" text color="#2f4f4f">
    Update record
    <v-icon class="ml-3" color="#2f4f4f">mdi-file-document-edit-outline</v-icon>
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
