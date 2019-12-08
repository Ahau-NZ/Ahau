<template>
  <svg>
    <g id="nodeGroup" :style="groupStyle">
      <!-- recursion of partners (first so they're drawing in background) -->
      <g v-if="!profile.isCollapsed">
        <g v-for="(partner, index) in partners" :key="partner.id">
          <Node :id="`node-${index}`"
            :node="partner"
            :radius="partnerRadius"
            :isPartner="true"
            :showLabel="false"
            @update="updateWidth"
            @openmenu="$emit('openmenu', $event)"
            @mouseover.native="handleMouseOver($event, partner, index)"
            @mouseout.native="handleMouseOut($event, partner, index)"
          />
        </g>
      </g>

      <g v-if="!isPartner" @click.left="click" @click.right.prevent="openMenu($event, profile.id)">
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

        <g v-if="profile.isCollapsed" :style="collapsedStyle">
          <text> ... </text>
        </g>
      </g>
      <g v-else @click.right.prevent="openMenu($event, profile.id)">
        <defs>
          <clipPath id="myPartnerCircle">
            <circle :cx="radius" :cy="radius" :r="radius" />
          </clipPath>
        </defs>
        <image
          :xlink:href="imageSource"
          :width="diameter"
          :height="diameter"
          clip-path="url(#myPartnerCircle)"
        />
      </g>

      <g id="node-label" v-if="showLabel" :style="textStyle">
        <rect :width="textWidth" y="-16" height="20"></rect>
        <text>{{ profile.preferredName }}</text>
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
    node: { type: Object, required: true },
    radius: { type: Number, required: true },
    isPartner: { type: Boolean, default: false },
    showLabel: { type: Boolean, required: true }
  },
  data () {
    return {
      offsetSize: 15,
      partnerRadius: 0.8 * this.radius,
      hover: false
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
      return {
        transform: `translate(${this.radius - (this.textWidth / 2)}px, ${this.diameter + 15}px)`
      }
    },
    partners(){
      var leftCount = 0
      var rightCount = 0
      if (this.isPartner) return []
      if (this.profile.partners === undefined) return []
      return this.profile.partners
        .map((d, i) => {
          var sign = (i % 2 == 0) ? 1 : -1
          var offset = (sign === 1)
          ? +2 * this.offsetSize
          : -1 * this.offsetSize
          var count = (sign === 1)
          ? ++leftCount
          : ++rightCount
          return {
            index: i,
            x: sign * count * this.partnerRadius + offset,
            y: 10,
            data: d,
            showLabel: false
          }
        })
        .reverse()
    },
    collapsedStyle () {
      // centers the text element under name
      return {
        fontSize: '30px',
        fontWeight: 600,
        transform: `translate(${this.radius - 3}px, ${this.diameter + 25}px) rotate(90deg)`
        // calculate the transform to draw nodes vertically
      }
    }
  },
  methods: {
    click () {
      this.$emit('click')
    },
    openMenu ($event, profileId) {
      this.$emit('openmenu', { $event, profileId })
    },
    updateWidth () {
      var width = d3.select('#nodeGroup')
        .node()
        .getBoundingClientRect()
        .width

      this.$emit('update', width)
    },
    handleMouseOver ($event, partner, index) {
      console.log('mouseover')
    },
    handleMouseOut ($event, partner, index) {
      console.log('mouseout')
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
