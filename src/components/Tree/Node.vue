<template>
  <circle :r="settings.radius" @click="onClick">
  </circle>
</template>
<script>
/* es-lint disable */

export default {
  props: ['node'],
  data () {
    return {
      settings: {
        radius: 40
      }
    }
  },
  methods: {
    onClick () {
      alert(this.node.name)
    }
  }
}
</script>

<style scoped lang="scss">
  circle {
    fill: #5f9ea0;
    stroke: black;
    &:hover {
      cursor: pointer;
      transform: scale(1.5);
    }
  }
</style>
