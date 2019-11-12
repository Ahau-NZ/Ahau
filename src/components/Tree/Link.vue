<template>
  <path class="link" :d="link.d" />
</template>

<script>
/* es-lint disable */
export default {
  props: ['link'],
  mounted(){
    
  }
}
</script>

<style scoped lang="scss">
  path {
    fill: none;
    stroke: black;
  }
</style>
