<template>
      <v-col class="add-row" @click="click" :style="{ justifyContent: align, height: height }" >
          <v-icon class="add-button" light>mdi-plus</v-icon>
          <span class="add-label" v-if="row">{{ label }}</span>
      </v-col>
  </template>

<script>
export default {
  name: 'AddButton',
  props: {
    label: String,
    align: { type: String, default: 'center' },
    row: { type: Boolean, default: false },
    height: { type: String }
  },
  methods: {
    click () {
      this.$emit('click')
    }
  }
}
</script>

  <style scoped lang="scss">
    .add-row {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0px;
    }

    .v-btn.add-button {
      border-radius: 5px;
      width: 20px;
      height: 20px;
      padding: 0px;
      font-size: 0.6em;
      color: rgba(0, 0, 0, 0.6);
      margin-right: 10px;
    }

    .add-label {
      font-size: 0.8em;
      color: rgba(0, 0, 0, 0.6);
    }
  </style>
