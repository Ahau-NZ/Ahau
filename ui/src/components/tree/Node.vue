<template>
  <g
    class="node"
    :style="position"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="click"
    @mousedown.right="openMenu($event, profile)"
    @contextmenu.prevent
  >
    <g v-if="showAvatars" class="avatar">
      <defs>
        <clipPath :id="clipPathId">
          <circle :cx="radius" :cy="radius" :r="radius"/>
        </clipPath>
      </defs>
      <circle
        :style="{fill: profile.deceased ? colours.deceased : colours.alive }"
        :cx="radius"
        :cy="radius"
        :r="radius"
      />
      <image
        :xlink:href="imageSrc"
        :width="diameter"
        :height="diameter"
        :clip-path="`url(#${clipPathId})`"
        :style="{ opacity: profile.deceased ? 0.5 : 1 }"
      />
      <NodeMenuButton
        v-if="showMenuButton"
        :transform="`translate(${1.4 * radius}, ${1.4 * radius})`"
        @click="openMenu($event, profile)"
      />
    </g>
    <g v-if="profile.isCollapsed" :style="collapsedStyle">
      <text> ... </text>
    </g>
    <g v-if="!showAvatars" :style="nameTextStyle">
      <rect :width="textWidth*2" y="-25" height="30"></rect>
      <text style="font-size: 30px;">{{ displayName }}</text>
    </g>
    <g v-else :style="textStyle">
      <rect :width="textWidth" y="-16" height="20"></rect>
      <text>{{ displayName }}</text>
    </g>
    <g
      v-if="isPartner && hasAncestors"
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
  </g>
</template>

<script>
import get from 'lodash.get'
import avatarHelper from '@/lib/avatar-helpers.js'
import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants.js'
import { getDisplayName } from '@/lib/person-helpers.js'
import NodeMenuButton from './NodeMenuButton.vue'

export default {
  name: 'Node',
  props: {
    node: Object,
    radius: {
      type: Number,
      default: 50
    },
    isPartner: Boolean,
    showAvatars: Boolean
  },
  components: {
    NodeMenuButton
  },
  data () {
    return {
      hover: false,
      colours: {
        alive: ALIVE_COLOUR,
        deceased: DECEASED_COLOUR
      }
    }
  },
  computed: {
    showMenuButton () {
      if (this.isPartner) return false
      if (!this.profile.isCollapsed) {
        if (this.hover) return true
        if (this.nodeCentered === this.node.data.id) return true
      }
      return false
    },
    hasAncestors () {
      return this.profile.parents && this.profile.parents.length > 0
    },
    clipPathId () {
      return this.isPartner ? 'partnerCirlce' : 'myCircle'
    },
    profile () {
      return this.node.data
    },
    diameter () {
      return this.radius * 2
    },
    imageSrc () {
      const uri = get(this.profile, 'avatarImage.uri')
      if (uri) return uri

      return avatarHelper.defaultImage(false, this.profile.aliveInterval, this.profile.gender)
    },
    position () {
      return {
        transform: `translate(${this.node.x}px, ${this.node.y}px)`
      }
    },
    textWidth () {
      const width = (this.displayName || '').length * 8
      return width
    },
    textStyle () {
      return {
        transform: `translate(${this.radius - this.textWidth / 2}px, ${this
          .diameter + 15}px)`
      }
    },
    nameTextStyle () {
      return {
        transform: `translate(${this.radius - this.textWidth}px, ${this.radius + 10}px)`
      }
    },
    collapsedStyle () {
      // centers the text element under name
      return {
        fontSize: '30px',
        fontWeight: 600,
        transform: `translate(${this.radius - 3}px, ${this.diameter +
          25}px) rotate(90deg)`
      }
    },
    displayName () {
      return getDisplayName(this.profile)
    }
  },
  methods: {
    openMenu (event, profile) {
      profile.isPartner = this.isPartner
      this.$emit('open-menu', { event, profile })
    },
    click () {
      // only change focus when the partner nodes are clicked
      if (this.isPartner) this.focus()
      else this.center()
    },
    focus () {
      this.$emit('focus', this.profile.id)
    },
    center () {
      this.$emit('center', this.node)
    }
  }
}
</script>

<style scoped lang="scss">
g {
  transition: all ease-in 0.2s;
  g.avatar {
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
