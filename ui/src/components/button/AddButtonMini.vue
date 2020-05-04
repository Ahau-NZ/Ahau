<template>
      <v-col class="add-row" @click="click" :style="{ justifyContent: align, height: height }" >
          <v-icon size="16" class="add-button pr-1" light>mdi-plus</v-icon>
          <span class="add-label">{{ label }}</span>
      </v-col>
  </template>

<script>
export default {
  name: 'AddButtonMini',
  props: {
    label: { type: String},
    align: { type: String, default: 'center' },
    height: { type: String}
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
      justify-content: center;
      align-items: center;
      cursor: pointer;
      padding: 0px;
    }

    v-icon.add-button {
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
