<template>
  <svg>
    <g :style="style">
      <defs>
        <clipPath id="myCircle">
          <circle :cx="radius" :cy="radius" :r="radius" />
        </clipPath>
      </defs>
      <image
        :width="imageConstraints"
        :height="imageConstraints"
        :xlink:href="imageSource"
        clip-path="url(#myCircle)"
        @click="click"
      />
      <text
        :x="textX"
        :y="imageConstraints+10"
      >
        {{ node.data.legalName }}
      </text>
    </g>
  </svg>
</template>
<script>
/* es-lint disable */

import tane from '@/assets/tane.svg'
import wahine from '@/assets/wahine.svg'

export default {
  props: {
    node: {
      type: Object,
      required: true
    },
    radius: {
      type: Number,
      required: true
    }
  },
  computed: {
    /*
      temporary function to display placeholder image of male or female based on gender
    */
    imageSource () {
      switch (this.node.data.gender) {
        case 'male': return tane
        case 'female': return wahine
        default: return wahine // TODO androgenous avatar
      }
    },
    /*
      required size for the image based on the given radius value
    */
    imageConstraints () {
      return this.radius * 2
    },
    textX () {
      return this.radius - (this.textWidth / 2)
    },
    textWidth () {
      var width = (this.node.data.legalName.length * 7.2)
      this.$emit('textWidth', width)
      return width
    },
    style () {
      return { transform: this.nodeVertical(this.node.x, this.node.y) } // sets the position of this node
    },
    spaces () {
      var spacesCount = 0
      var text = this.node.data.legalName
      for (var i = 1; i < text.length; i++) {
        if (text.charAt(i) === ' ') {
          spacesCount++
        }
      }
      console.log('spaces: ' + spacesCount)
      return spacesCount
    }

  },
  methods: {
    click () {
      this.$emit('click', this.node)
    },
    nodeHorizontal (x, y) {
      // calculate the transform to draw nodes horizontally
      return `translate(${y}px, ${x}px)`
    },
    nodeVertical (x, y) {
      // calculate the transform to draw nodes vertically
      return `translate(${x}px, ${y}px)`
    }
  }
}
</script>

<style scoped lang="scss">
  svg:not(:root) {
    overflow: visible;
  }
  svg:hover{
    cursor: pointer;
  }
</style>
