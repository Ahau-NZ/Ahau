<template>
  <g
    class="node"
    :style="position"
    @mouseover="setHover(true)"
    @mouseleave="setHover(false)"
    @mousedown.right="openMenu"
    @contextmenu.prevent
  >

    <g v-if="showAvatars" :style="textStyle">
      <rect :width="textWidth" y="-16" height="20"></rect>
      <text>{{ displayName }}</text>
    </g>
    <g v-else :style="nameTextStyle" @click="$emit('click')" >
      <rect :width="textWidth*2" y="-25" height="30" />
      <text :style="{ fontSize: 30, fill: isSelected ? 'rgb(178, 37, 38)' : '#555' }">
        {{ displayName }}
      </text>
    </g>

    <g v-if="showAvatars" class="avatar" @click="$emit('click')" >
      <defs v-if="imageSrc">
        <clipPath :id="clipPathId">
          <circle :cx="radius" :cy="radius" :r="radius"/>
        </clipPath>
      </defs>

      <circle v-if="isSelected"
        :style="{ fill: 'rgb(178, 37, 38)' }"
        :cx="radius"
        :cy="radius"
        :r="radius + 4"
      />
      <!--
        keen to get rid of background circle, but to do this need to change the color
        of the default avatar (which is white)

        <circle v-if="!imageSrc && profile.deceased"
      -->
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
        :style="avatarStyle"
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
    <g v-if="hasUndrawnSubtree" :style="dotsUnderNode" @click="toggleNodeCollapse(profileId)" >
      <rect width="40" height="40" y="-20" style="fill: rgba(0,0,0,0);" />
      <!-- this rect helps the group be big enough to easily click on -->
      <text> ...  </text>
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
  name: 'TreeNode',
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
    ...mapGetters('person', ['person', 'selectedProfileId']),
    ...mapGetters('whakapapa', ['getImportantRelationship', 'isCollapsedNode', 'getParentIds', 'getRawChildIds', 'getRawPartnerIds']),
    ...mapGetters('tree', ['hoveredProfileId', 'getNode', 'getPartnerNode']),
    profile () {
      return this.person(this.profileId) || {}
    },
    isCollapsed () {
      return this.isCollapsedNode(this.profileId)
    },
    isSelected () {
      return this.selectedProfileId === this.profileId
    },
    isDuplicate () {
      const rule = this.getImportantRelationship(this.profileId)
      if (!rule) return false
      return rule.other.length > 1
      // TODO 2022-02-11 mix - ideally we won't lean on "other". Is there another way to do this?
      // Idea - make a getAllNodes + getAllParterNodes (which doesn't just find the first)
    },
    hasUndrawnSubtree () {
      if (this.isCollapsed) {
        const undrawnDescendants = this.getRawChildIds(this.profileId)
          .filter(id => !this.getNode(id))
          .length > 0
        if (undrawnDescendants) return true

        const undrawnPartners = this.getRawPartnerIds(this.profileId)
          .filter(id => !this.getPartnerNode(id))
          .length > 0
        if (undrawnPartners) return true
      }

      return false
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
    avatarStyle () {
      return this.profile.deceased
        ? { filter: 'grayscale(1) sepia(0.2)' }
        : {}
    },
    dotsUnderNode () {
      // centers the three dots underneath a nodes name
      const y = (
        (this.showAvatars ? this.radius : 0) +
        (this.isPartner ? 55 : 70)
      )

      return {
        fontSize: '22px',
        fontWeight: 600,
        transform: `
          translate(${this.radius - 2}px, ${y}px)
          rotate(90deg)
        `
      }
    },
    dotsAboveNode () {
      // centers the three dots above a node
      return {
        fontSize: '22px',
        fontWeight: 600,
        transform: `
          translate(${this.radius - 2}px, ${this.radius - (this.isPartner ? 57 : 72)}px)
          rotate(90deg)
        `
      }
    },
    displayName () {
      return getDisplayName(this.profile)
    }
  },
  methods: {
    ...mapActions('whakapapa', ['toggleNodeCollapse']),
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
