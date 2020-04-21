<template>
  <g :id="node.nodeId" :style="groupStyle">
    <!-- recursion of partners (first so they're drawing in background) -->
    <g v-if="!profile.isCollapsed">
      <g v-for="partner in partners" :key="partner.nodeId">
        <Node
          :id="partner.nodeId"
          :radius="partnerRadius"
          :isPartner="true"
          :node="partner"
          :nonFocusedPartners="nonFocusedPartners"
          @change-focus="$emit('change-focus', partner.data.id)"
          @open-context-menu="openMenu($event, partner.data, true)"
        />
      </g>
    </g>

    <g class="avatar -main" v-if="!isPartner" @click.left="click">
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
      <g v-if="profile.isCollapsed" :style="collapsedStyle">
        <text> ... </text>
      </g>
      <g
        class="menu-button"
        v-else
        @click.stop="openMenu($event, profile, false)"
        :transform="`translate(${1.4 * radius}, ${1.4 * radius})`"
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
    </g>

    <g v-else class="avatar -partner" @click="$emit('change-focus', $event)">
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
        @click.stop="openMenu($event, profile, true)"
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
    </g>

    <g id="node-label" :style="textStyle">
      <rect :width="textWidth" y="-16" height="20"></rect>
      <text>{{ profile.preferredName }}</text>
    </g>
    <!-- Changes focus -->
    <g
      v-if="nonFocusedPartners.includes(profile.id)"
      :transform="`translate(${1 * radius}, ${radius * -0.5})`"
    >
      <text
        font-size="30"
        font-weight="600"
        cursor="initial"
        style="fill:#000;"
        transform="rotate(90)"
      >..</text>
    </g>
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="grey" flood-opacity="0.5"/>
      </filter>
    </defs>
    <g v-if="profile.isCollapsed" :style="collapsedStyle">
      <text> ... </text>
    </g>
  </g>
</template>

<script>
import get from 'lodash.get'
import avatarHelper from '@/lib/avatar-helpers.js'
import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants.js'
// import flower.svg from '@/src/assets'

export default {
  name: 'Node',
  props: {
    node: { type: Object, required: true },
    radius: { type: Number, required: true },
    isPartner: { type: Boolean, default: false },
    nonFocusedPartners: { type: Array }

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
    profile () {
      return this.node.data
    },
    nonFocusedPartner () {
      return this.node.data.nonFocusedPartner
    },
    diameter () {
      return this.radius * 2
    },
    imageSource () {
      const uri = get(this.node, 'data.avatarImage.uri')
      if (uri) return uri

      return avatarHelper.defaultImage(false, this.profile.bornAt, this.profile.gender)
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
    textStyle () {
      return {
        transform: `translate(${this.radius - this.textWidth / 2}px, ${this
          .diameter + 15}px)`
      }
    },
    collapsedStyle () {
      // centers the text element under name
      return {
        fontSize: '30px',
        fontWeight: 600,
        transform: `translate(${this.radius - 3}px, ${this.diameter +
          25}px) rotate(90deg)`
        // calculate the transform to draw nodes vertically
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
    click () {
      this.$emit('click')
    },
    openMenu ($event, profile, isPartner) {
      profile.isPartner = isPartner
      this.$emit('open-context-menu', { event, profile })
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
    image {
    }

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
