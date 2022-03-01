<template>
  <g
    class="node"
    :style="position"
    @mouseover="setHover(true)"
    @mouseleave="setHover(false)"
    @click="$emit('click')"
    @mousedown.right="openMenu"
    @contextmenu.prevent
  >
    <g v-if="showAvatars" class="avatar">
      <defs>
        <clipPath :id="clipPathId">
          <circle :cx="radius" :cy="radius" :r="radius"/>
        </clipPath>
      </defs>
      <circle v-if="!imageSrc"
        :style="{ fill: profile.deceased ? colours.deceased : colours.alive }"
        :cx="radius"
        :cy="radius"
        :r="radius"
      />
      <image
        :xlink:href="imageSrc || defaultImage()"
        :width="diameter"
        :height="diameter"
        :clip-path="`url(#${clipPathId})`"
        :style="{ opacity: profile.deceased ? 0.5 : 1 }"
      />
      <NodeMenuButton
        v-if="showMenuButton"
        :transform="`translate(${1.44 * radius}, ${1.44 * radius})`"
        @click="openMenu"
      />
    </g>

    <g v-if="hasUndrawnAscendants" :style="dotsAboveNode">
      <text> ... </text>
    </g>
    <g v-if="isCollapsed || hasUndrawnDescendants" :style="dotsUnderNode">
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

    <g v-if="isPartner && hasAncestors && !isDuplicate"
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

import NodeMenuButton from './NodeMenuButton.vue'

import avatarHelper from '@/lib/avatar-helpers.js'
import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants.js'
import { getDisplayName } from '@/lib/person-helpers.js'
import { RADIUS, PARTNER_RADIUS } from '@/store/modules/tree/constants'

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
      colours: {
        alive: ALIVE_COLOUR,
        deceased: DECEASED_COLOUR
      },
      radius: this.isPartner ? PARTNER_RADIUS : RADIUS
    }
  },
  mounted () {
    this.loadPersonMinimal(this.profileId)
  },
  computed: {
    ...mapGetters('person', ['person']),
    ...mapGetters('whakapapa', ['getImportantRelationship', 'isCollapsedNode', 'getParentIds', 'getChildIds']),
    ...mapGetters('tree', ['hoveredProfileId', 'getNode', 'getPartnerNode']),
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
    hasUndrawnDescendants () {
      return this.getChildIds(this.profileId)
        .filter(id => !this.getNode(id))
        .length > 0
    },
    hasUndrawnAscendants () {
      return this.getParentIds(this.profileId)
        .filter(id => !this.getNode(id) && !this.getPartnerNode(id))
        .length > 0
    },
    showMenuButton () {
      // if (this.isPartner) return false
      if (this.isCollapsed) return false

      return this.hoveredProfileId === this.profileId
    },
    hasAncestors () {
      return (
        this.getParentIds(this.profileId) > 0 ||
        (this.profile.parents && this.profile.parents.length > 0)
      )
    },
    clipPathId () {
      return this.isPartner ? 'partnerCirlce' : 'myCircle'
    },
    diameter () {
      return this.radius * 2
    },
    imageSrc () {
      return get(this.profile, 'avatarImage.uri')
    },
    position () {
      return {
        transform: `translate(${this.x - this.radius}px, ${this.y - this.radius}px)`
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
    dotsUnderNode () {
      // centers the three dots underneath a nodes name
      return {
        fontSize: '22px',
        fontWeight: 600,
        transform: `translate(${this.radius - 2}px, ${this.radius + (this.isPartner ? 55 : 70)}px) rotate(90deg)`
      }
    },
    dotsAboveNode () {
      // centers the three dots above a node
      return {
        fontSize: '22px',
        fontWeight: 600,
        transform: `translate(${this.radius - 2}px, ${this.radius - (this.isPartner ? 57 : 72)}px) rotate(90deg)`
      }
    },
    displayName () {
      return getDisplayName(this.profile)
    }
  },
  methods: {
    ...mapActions('tree', ['setMouseEvent', 'setHoveredProfileId']),
    ...mapActions('person', ['loadPersonMinimal', 'setSelectedProfileById']),
    defaultImage () {
      return avatarHelper.defaultImage(false, this.profile.aliveInterval, this.profile.gender)
    },
    openMenu (e) {
      this.setMouseEvent(e)
      this.setSelectedProfileById(this.profileId)
    },
    setHover (bool = false) {
      if (bool) this.setHoveredProfileId(this.profileId)
      else this.setHoveredProfileId(null)
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
