<template>
<svg :width="width - 50">
  <g :id="node.id" :style="groupStyle">
    <!-- recursion of partners (first so they're drawing in background) -->
    <!-- <g v-if="!profile.isCollapsed">
      <g v-for="partner in partners" :key="partner.nodeId">
        <Node
          :id="partner.nodeId"
          :radius="partnerRadius"
          :isPartner="true"
          :node="partner"
          @open-context-menu="$emit('open-context-menu', $event)"
        />
      </g>
    </g> -->
    <g
      class="avatar -main"
      @click.prevent="click"
      @mousedown.right="openMenu($event, profile)"
      @contextmenu.prevent
    >
      <defs>
        <clipPath id="myCircle">
          <circle :cx="radius" :cy="radius" :r="radius" />
        </clipPath>
      </defs>
      <circle
        :style="{ fill: profile.deceased ? colours.deceased : colours.alive }"
        :cx="radius"
        :cy="radius"
        :r="radius - 1"
      />
      <image
        :xlink:href="imageSource"
        :width="diameter"
        :height="diameter"
        clip-path="url(#myCircle)"
        :style="{ opacity: profile.deceased ? 0.5 : 1 }"
      />
      <g
        v-if="!isPartner"
        class="menu-button"
        @click.prevent.stop="openMenu($event, profile)"
        :transform="`translate(${1.4 * radius}, ${1.4 * radius})`"
      >
        <circle
          v-if="mobile"
          opacity="0"
          cx="20"
          cy="1"
          r="22"
        />
        <circle
          stroke="white"
          fill="white"
          filter="url(#shadow)"
          cx="20"
          cy="1"
          r="10"
        />
        <polygon points="15,0  25,0  20,6" style="fill:#000;" />
      </g>
    </g>

    <!-- <g v-else class="avatar -partner">
      <defs>
        <clipPath id="myPartnerCircle">
          <circle :cx="radius" :cy="radius" :r="radius" />
        </clipPath>
      </defs>
      <circle
        :style="{ fill: profile.deceased ? colours.deceased : colours.alive }"
        :cx="radius"
        :cy="radius"
        :r="radius - 1"
      />
      <image
        :xlink:href="imageSource"
        :width="diameter"
        :height="diameter"
        clip-path="url(#myPartnerCircle)"
        :style="{ opacity: profile.deceased ? 0.5 : 1 }"
      />

      <g
        class="menu-button"
        @click.stop="openMenu($event, profile.id)"
        :transform="partnerMenuTranslate"
      >
        <circle
          stroke="white"
          fill="white"
          filter="url(#shadow)"
          cx="20"
          cy="1"
          r="10"
        />
        <polygon points="15,0  25,0  20,6" style="fill:#000;" />
      </g>
    </g> -->

    <g id="node-label" :style="textStyle">
      <!-- <rect :width="textWidth" y="-16" height="10"></rect> -->
      <text>{{ profile.legalName }}</text>
    </g>
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="grey" flood-opacity="0.5"/>
      </filter>
    </defs>
  </g>
  <g v-if="isPartner && !hideLabel" :style="displayNameStyle">
    <text>
      {{ getDisplayName(node) }}
    </text>
  </g>
</svg>
</template>

<script>
import get from 'lodash.get'
import avatarHelper from '@/lib/avatar-helpers.js'
import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants.js'
import { getDisplayName } from '@/lib/person-helpers.js'
// import flower.svg from '@/src/assets'

export default {
  name: 'Node',
  props: {
    node: { type: Object, required: true },
    radius: { type: Number, required: true },
    isPartner: { type: Boolean, default: false },
    hideLabel: { type: Boolean, default: false },
    width: { type: Number, required: true }
  },
  data () {
    return {
      offsetSize: 15,
      partnerRadius: 0.8 * this.radius,
      colours: {
        alive: ALIVE_COLOUR,
        deceased: DECEASED_COLOUR
      }
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    profile () {
      if (this.isPartner) return this.node
      return this.node.data
    },
    diameter () {
      return this.radius * 2
    },
    imageSource () {
      const uri = this.isPartner ? get(this.node, 'avatarImage.uri') : get(this.node, 'data.avatarImage.uri')
      if (uri) return uri

      return avatarHelper.defaultImage(false, this.profile.aliveInterval, this.profile.gender)
    },
    textWidth () {
      // const { x, y } = textElm.getBBox();
      const width = (this.profile.preferredName || '').length * 8
      return width
    },
    groupStyle () {
      return {
        transform: `translate(${this.node.x}px, ${this.node.y}px)`
      }
    },
    displayNameStyle () {
      return {
        transform: `translate(${this.node.x + 45}px, ${this.node.y + 25}px)`
      }
    },
    textStyle () {
      return {
        transform: `translate(${this.radius * 2.5}px, ${this
          .radius + 5}px)`
      }
    },
    partners () {
      if (this.isPartner || this.profile.partners === undefined) return []
      return this.getPartners()
    },
    partnerMenuTranslate () {
      const x = this.node.right ? -0.3 : 1.4
      return `translate(${x * this.radius} ${1.3 * this.radius})`
    }
  },
  methods: {
    getDisplayName,
    click () {
      if (this.isPartner) {
        const dialog = 'view-edit-node'
        const type = null
        const profile = this.node
        this.$emit('open', { dialog, type, profile })
      } else this.$emit('click')
    },
    openMenu ($event, profile) {
      this.$emit('open-menu', { $event, profile })
    },
    getPartners () {
      var leftCount = 0
      var rightCount = 0
      return this.profile.partners
        .map((d, i) => {
          var sign = i % 2 === 0 ? 1 : -1
          var offset = sign === 1 ? +2 * this.offsetSize : -1 * this.offsetSize
          var count = sign === 1 ? ++leftCount : ++rightCount
          return {
            index: `${this.node.nodeId}-partner-${i}`,
            x: sign * count * this.partnerRadius + offset,
            y: 10,
            data: d,
            right: sign === -1
          }
        })
        .reverse()
    }
  }
}
</script>

<style scoped lang="scss">
g {
  transition: all ease-in 0.1s;

  g.avatar {

    .menu-button {
      transition: opacity ease-in 0.2s;
      opacity: 0;
    }

    &:hover {
      .menu-button {
        opacity: 1;
      }
      image {
        filter: contrast(1.4) brightness(1.4);
      }
    }
  }
  rect {
    fill: #fff;
  }
  text {
    fill: #555;
  }

  &:not(:root) {
    overflow: visible;
  }
  &:hover {
    cursor: pointer;
  }
}
</style>
