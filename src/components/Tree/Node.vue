<template>
  <circle :r="radius">
  </circle>
</template>
<script>
/* es-lint disable */

export default {
  components: {

  },
  props: ['node'],
  mounted () {
    console.log(this.node.id + " " + this.node.x + "," + this.node.y)
  },
  data () {
    return {
      open: false
    }
  },
  computed: {
    radius () {
      return this.node.radius
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
