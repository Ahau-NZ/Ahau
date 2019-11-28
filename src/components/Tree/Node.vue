<template>
  <svg>
    <g :style="groupStyle" @click="click">
      <defs>
        <clipPath id="myCircle">
          <circle :cx="radius" :cy="radius" :r="radius" />
        </clipPath>
      </defs>
      <image
        :width="diameter"
        :height="diameter"
        :xlink:href="imageSource"
        clip-path="url(#myCircle)"
        
      />
      <g :style="textStyle">
        <rect :width="textWidth" y="-16" height="20"></rect>
        <text>{{ node.data.preferredName }}</text>
      </g>
    </g>
  </svg>
</template>

<script>
import get from 'lodash.get'
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
    diameter () {
      return this.radius * 2
    },
    imageSource () {
      const uri = get(this.node, 'data.avatarImage.uri')
      if (uri) return uri

      // fallback
      switch (this.node.data.gender) {
        case 'male': return tane
        case 'female': return wahine
        default: return wahine // TODO androgenous avatar
      }
    },
    textWidth () {
      // const { x, y } = textElm.getBBox();
      const width = (this.node.data.preferredName.length * 8)
      this.$emit('textWidth', width)
      return width
    },
    groupStyle () {
      // sets the position of this node
      return {
        transform: `translate(${this.node.x}px, ${this.node.y}px)`
        // calculate the transform to draw nodes vertically
      }
    },
    textStyle () {
      // centers the text element under image

      return {
        transform: `translate(${this.radius - (this.textWidth / 2)}px, ${this.diameter + 15}px)`
        // calculate the transform to draw nodes vertically
      }
    }
  },
  methods: {
    click () {
      this.$emit('click')
    }
  }
}
</script>

<style scoped lang="scss">
  svg {
    &:not(:root) {
      overflow: visible;
    }
    &:hover{
      cursor: pointer;
    }

    rect {
      fill: #FFF;
    }
    text {
      fill: #555;
    }
  }
</style>