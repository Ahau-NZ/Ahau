<template>
  <path class="link" :d="link.d" />
</template>

<script>
export default {
  props: {
    link: {
      type: Object,
      required: true
    },
    branch: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
path {
  fill: none;
  stroke: black;
}
</style>
