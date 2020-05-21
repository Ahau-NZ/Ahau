<template>
  <v-tooltip left>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on"  dark @click="toggle()" small :class="mobile ? 'my-2 mr-2': 'my-2'" text>
          Update media
          <v-icon small class="ml-3">mdi-image-edit-outline</v-icon>
        </v-btn>
    </template>
    <span>Update Artefact</span>
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
