<template>
  <v-col>
    <v-row :justify="row ? '' : 'center'" align="center">
      <v-btn @click="click"
        small
        fab
        color="white"
        >
        <v-icon class="black--text">mdi-plus</v-icon>
      </v-btn>
      &nbsp; &nbsp; {{ row ? label : ''}}
    </v-row>
    <v-row v-if="label && !row" justify="center" class="pt-1">
      {{ label }}
    </v-row>
  </v-col>
</template>

<script>
export default {
  name: 'AddButton',
  props: {
    label: String,
    row: { type: Boolean, default: false }
  }
}
</script>
