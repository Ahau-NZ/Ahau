<template>
  <v-col>
    <v-row justify="center">
      <v-btn @click="click"
        small
        fab
        color="white"
        >
        <v-icon class="black--text">mdi-plus</v-icon>
      </v-btn>
    </v-row>
    <v-row justify="center" class="pt-1">
      {{ label }}
    </v-row>
  </v-col>
</template>

<script>
export default {
  name: 'AddButton',
  props: {
    label: String
  }
}
</script>
