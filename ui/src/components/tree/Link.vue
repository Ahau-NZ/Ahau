<template>
  <path :d="link.d" :style="style"/>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    link: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters('tree', ['hoveredProfileId']),
    style () {
      if (hasHoveredParent(this.link, this.hoveredProfileId)) {
        return {
          ...this.link.style,
          stroke: 'red',
          strokeWidth: this.link.style.strokeWidth + 1
        }
      }

      return this.link.style
    }
  }
}

function hasHoveredParent (link, hoveredProfileId) {
  if (link.parent === hoveredProfileId) return true
  if (link.parents) {
    if (link.parents[0] === hoveredProfileId) return true
    if (link.parents[1] === hoveredProfileId) return true
  }
  return false
}

</script>

<style scoped lang="scss">
path {
  transition:
    stroke 0.2s ease,
    stroke-width 1s ease;
}
</style>
