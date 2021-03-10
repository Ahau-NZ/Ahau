<template>
  <g :style="position">
    <defs>
      <clipPath>
        <circle :cx="radius" :cy="radius" />
      </clipPath>
    </defs>
    <circle
      :style="{ fill: profile.deceased ? colours.deceased : colours.alive }"
      :cx="radius"
      :cy="radius"
      :r="radius - 1"
    />
    <image
      :xlink:href="imageSrc"
      :width="diameter"
      :height="diameter"
      clip-path="url(#myCircle)"
      :style="{ opacity: profile.deceased ? 0.5 : 1 }"
    />
    <g v-if="profile.isCollapsed" :style="collapsedStyle">
      <text> ... </text>
    </g>
    <g :style="textStyle">
      <rect :width="textWidth" y="-16" height="20"></rect>
      <text>{{ displayName }}</text>
    </g>
  </g>
</template>

<script>
import get from 'lodash.get'
import avatarHelper from '@/lib/avatar-helpers.js'
import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants.js'
import { getDisplayName } from '@/lib/person-helpers.js'

export default {
  name: 'Node',
  props: {
    node: Object,
    radius: {
      type: Number,
      default: 50
    },
    partner: Boolean
  },
  data () {
    return {
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
      // const { x, y } = textElm.getBBox();
      const width = (this.displayName || '').length * 8
      return width
    },
    textStyle () {
      return {
        transform: `translate(${this.radius - this.textWidth / 2}px, ${this
          .diameter + 15}px)`
      }
    },
    displayName () {
      return getDisplayName(this.profile)
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
      opacity: 1;
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
