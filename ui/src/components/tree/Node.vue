<template>
  <g
    class="node"
    :style="position"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="click"
    @mousedown.right="openMenu"
    @contextmenu.prevent
  >
    <g v-if="showAvatars" class="avatar">
      <defs>
        <clipPath :id="clipPathId">
          <circle :cx="radius" :cy="radius" :r="radius"/>
        </clipPath>
      </defs>
      <circle
        :style="{ fill: profile.deceased ? colours.deceased : colours.alive }"
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
        @click="openMenu"
      />
    </g>
    <g v-if="isCollapsed" :style="collapsedStyle">
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
      v-if="isPartner && hasAncestors && !isDuplicate"
      :transform="`translate(${1 * radius - 2}, ${radius * -0.5})`"
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
import { mapGetters, mapActions } from 'vuex'

import avatarHelper from '@/lib/avatar-helpers.js'
import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants.js'
import { getDisplayName } from '@/lib/person-helpers.js'
import NodeMenuButton from './NodeMenuButton.vue'

const RADIUS = 50
const PARTNER_SHRINK = 0.7

export default {
  name: 'Node',
  props: {
    profileId: { type: String, required: true },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
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
      },
      radius: this.isPartner ? PARTNER_SHRINK * RADIUS : RADIUS
    }
  },
  mounted () {
    this.loadPersonMinimal(this.profileId)
  },
  computed: {
    ...mapGetters('person', ['person']),
    ...mapGetters('whakapapa', ['getImportantRelationship', 'isCollapsedNode']),
    profile () {
      return this.person(this.profileId) || {}
    },
    isCollapsed () {
      return this.isCollapsedNode(this.profileId)
    },
    isDuplicate () {
      const rule = this.getImportantRelationship(this.profileId)
      if (!rule) return false
      return rule.other.length > 1
      // TODO 2022-02-11 mix - ideally we won't lean on "other". Is there another way to do this?
    },
    showMenuButton () {
      if (this.isPartner) return false
      if (!this.isCollapsed) {
        if (this.hover) return true
      }
      return false
    },
    hasAncestors () {
      return this.profile.parents && this.profile.parents.length > 0
    },
    clipPathId () {
      return this.isPartner ? 'partnerCirlce' : 'myCircle'
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
        transform: `translate(${this.x}px, ${this.y}px)`
      }
    },
    textWidth () {
      const width = (this.displayName || '').length * 8
      return width
    },
    textStyle () {
      return {
        transform: `translate(${this.radius - this.textWidth / 2}px, ${this
          .diameter + 16}px)`
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
    ...mapActions('tree', ['setMouseEvent']),
    ...mapActions('person', ['loadPersonMinimal', 'setSelectedProfileById']),
    openMenu (e) {
      this.setMouseEvent(e)
      this.setSelectedProfileById(this.profileId)
    },
    click () {
      // only change focus when the partner nodes are clicked
      if (this.isPartner) this.$emit('focus', this.profileId)
      else this.$emit('center')
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
