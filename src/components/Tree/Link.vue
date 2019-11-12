<template>
  <path class="link" :d="d" />
</template>

<script>
export default {
  props: ['d']
}
</script>

<style scoped lang="scss">
  path {
    fill: none;
    stroke: black;
  }
</style>
