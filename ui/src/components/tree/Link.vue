<template>
  <path :d="link.d" :style="style" />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'WhakapapaLink',
  props: {
    link: {
      type: Object,
      required: true
    },
    highlight: Boolean
  },
  computed: {
    ...mapGetters('tree', ['hoveredProfileId']),
    hasHoveredParent () {
      if (this.link.parent === this.hoveredProfileId) return true
      if (this.link.parents) {
        if (this.link.parents[0] === this.hoveredProfileId) return true
        if (this.link.parents[1] === this.hoveredProfileId) return true
      }
      return false
    },
    isHighlighted () {
      return this.hasHoveredParent || this.highlight
    },
    style () {
      if (this.isHighlighted) {
        return {
          ...this.link.style,
          stroke: '#c72e19',
          strokeWidth: this.link.style.strokeWidth + 1
        }
      }

      return this.link.style
    }
  }
}

</script>

<style scoped lang="scss">
path {
  transition:
    stroke 0.2s ease,
    stroke-width 1s ease;
}
</style>
