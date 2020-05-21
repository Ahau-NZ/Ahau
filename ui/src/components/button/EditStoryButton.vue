<template>
  <v-tooltip left>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on"  @click="toggle()" class="pr-0" text color="#383838">
          Edit story
          <v-icon class="black--text ml-3">mdi-file-document-edit-outline</v-icon>
        </v-btn>
    </template>
    <span>Update record</span>
  </v-tooltip>
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
