<template>
  <v-col justify="center" align="center">
    <v-row :justify="row ? null : 'center'" align="center">
      <v-btn @click="click" small fab color="white">
        <v-icon class="black--text">mdi-plus</v-icon>
      </v-btn>
      <span class="ml-2" v-if="row">{{ label }}</span>
    </v-row>
    <v-row v-if="label && !row" justify="center" align="center" class="pt-1">
      <span> {{ label }} </span>
    </v-row>
  </v-col>
</template>

<script>
export default {
  name: 'AddButton',
  props: {
    label: String,
    row: { type: Boolean, default: false }
  },
  methods: {
    click () {
      this.$emit('click')
    }
  }
}
</script>
