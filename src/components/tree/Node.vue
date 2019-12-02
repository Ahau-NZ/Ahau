<template>
  <svg>
    <g id="nodeGroup" :style="groupStyle" @click="click">
      <g v-for="(partner, index) in partners" :key="index">
        <Node
          v-if="main && hasPartner"
          :node="partner"
          :radius="radius"
          :main="false"
        ></Node>
      </g>
      <defs>
        <clipPath id="myCircle">
          <circle :cx="radius" :cy="radius" :r="radius" />
        </clipPath>
      </defs>
      <image
        :xlink:href="imageSource"
        :width="diameter"
        :height="diameter"
        clip-path="url(#myCircle)"
      />
      <g v-if="main" :style="textStyle">
        <rect :width="textWidth" y="-16" height="20"></rect>
        <text>{{ profile.preferredName }}</text>
      </g>
      <g v-if="profile.isCollapsed" :style="collapsedStyle">
        <text> ... </text>
      </g>
    </g>
  </svg>
</template>

<script>
import get from 'lodash.get'
import tane from '@/assets/tane.svg'
import wahine from '@/assets/wahine.svg'

import * as d3 from 'd3' // will be changed later on

export default {
  name: 'Node',
  props: {
    node: {
      type: Object,
      required: true
    },
    radius: {
      type: Number,
      required: true
    },
    main: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      count: 0
    }
  },
  computed: {
    profile () {
      return this.node.data
    },
    diameter () {
      return this.radius * 2
    },
    imageSource () {
      const uri = get(this.node, 'data.avatarImage.uri')
      if (uri) return uri

      // fallback
      switch (this.profile.gender) {
        case 'male': return tane
        case 'female': return wahine
        default: return wahine // TODO androgenous avatar
      }
    },
    textWidth () {
      // const { x, y } = textElm.getBBox();
      const width = (this.profile.preferredName.length * 8)
      return width
    },
    groupStyle () {
      return {
        transform: `translate(${this.node.x}px, ${this.node.y}px)`
      }
    },
    textStyle () {
      // centers the text element under image

      return {
        transform: `translate(${this.radius - (this.textWidth / 2)}px, ${this.diameter + 15}px)`
        // calculate the transform to draw nodes vertically
      }
    },
    partners () {
      // if (this.hasPartner) {
      //  return this.node.partners // change to node.data.partners OR profile.partners
      //    .map((d, i) => {
      //      const x = (i + 1) * this.radius
      //      return {
      //        data: d,
      //        x: x,
      //        y: 10
      //      }
      //    })
      //    .slice()
      //    .reverse()
      // }
      // return undefined
      if(!this.hasPartner){
        return undefined
      }
      let partners = this.leftSide.concat(this.rightSide)
      console.log(partners)
      return partners
    },
    npartners(){
      return this.node.partners
    },
    leftSide(){
      var count = 0
      var half_len = Math.ceil(this.npartners.length / 2)
      let leftPartners = this.npartners
        .splice(0, half_len)
        .map((d, i) => {
          var x = -(++count * this.radius)
          return {
            data: d,
            x: x,
            y: 10
          }
        })
      
      return leftPartners
    },
    rightSide(){
      var count = 0
      var half_len = Math.ceil(this.npartners.length / 2)
      let rightPartners = this.npartners
        .splice(half_len-1, this.npartners.length)
        .map((d, i) => {
          var x = (++count * this.radius)
          return {
            data: d,
            x: x,
            y: 10
          }
        })
      
      return rightPartners
    },
    collapsedStyle () {
      // centers the text element under name
      return {
        fontSize: '30px',
        fontWeight: 600,
        transform: `translate(${this.radius - 3}px, ${this.diameter + 25}px) rotate(90deg)`
        // calculate the transform to draw nodes vertically
      }
    },
    hasPartner () {
      return this.node.partners !== undefined
    }
  },
  methods: {
    click () {
      this.$emit('click')
    }
  },
  mounted () {
    var width = d3.select('#nodeGroup')
      .node()
      .getBoundingClientRect()
      .width

    this.$emit('update', width)
    if(this.hasPartner){
      this.partners
      console.log('------------')
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

    image {
      transition: ease-in 0.2s;

      &:hover{
        filter: contrast(1.4) brightness(1.4);
      }
    }
    rect {
      fill: #fff;
    }
    text {
      fill: #555;
    }
  }
</style>
