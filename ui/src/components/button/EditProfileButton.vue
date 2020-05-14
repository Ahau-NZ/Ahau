<template>
  <v-tooltip left>
    <template v-slot:activator="{ on }">
        <v-btn v-on="on"  @click="toggle()" x-small class="my-2" fab color="white">
          <v-icon small class="black--text">mdi-pencil</v-icon>
        </v-btn>
    </template>
    <span>Edit profile</span>
  </v-tooltip>
</template>
<script>
export default {
  // name: 'HelpButton',
  methods: {
    toggle () {
      this.$emit('click')
    }
  }
}

</script>

  