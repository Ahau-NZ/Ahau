<template>
  <v-col class="add-row" @click="click" :style="{ justifyContent: align, height: height }">
    <v-icon :size="size" :class="iconClass" class="add-button pr-1" :dark="dark">{{icon}}</v-icon>
    <span :class="`add-label ${dark ? 'white--text' : ''}`">{{ label }}</span>
  </v-col>
</template>

<script>
export default {
  name: 'AddButton',
  props: {
    label: String,
    align: { type: String, default: 'center' },
    row: { type: Boolean, default: false },
    height: { type: String },
    size: { type: String, default: '20px' },
    icon: { type: String, default: 'mdi-plus' },
    iconClass: String,
    dark: { type: Boolean, default: false }
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
