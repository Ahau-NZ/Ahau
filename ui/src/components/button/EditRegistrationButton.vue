<template>
  <v-tooltip left>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on"  @click="toggle()" :small="!mobile" :x-small="mobile" :class="mobile ? 'my-2 ml-2': 'my-2'" fab color="white" elevation="2">
          <v-icon :medium ="!mobile" :small="mobile" class="black--text">mdi-file-document-edit</v-icon>
        </v-btn>
    </template>
    <span>Edit profile</span>
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
