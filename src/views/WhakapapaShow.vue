<template>
  <Tree :viewId="id"/>
</template>

<script>
import Tree from '@/components/Tree/Tree.vue'
export default {
  data () {
    return {
      id: this.$route.params.id
    }
  },
  components: {
    Tree
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .body-width {
    max-width: 900px;
  }
</style>
