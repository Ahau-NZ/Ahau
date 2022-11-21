<template>
  <g
    v-if="profile"
    class="node"
    :transform="`translate(${x} ${y})`"
    @mouseover="setHover(true)"
    @mouseleave="setHover(false)"
    @mousedown.right="openMenu"
    @contextmenu.prevent
    ref="node"
  >

    <g v-if="showAvatars" :transform="`translate(0 ${radius + 12})`">
      <rect
        :width="textWidth"
        :height="textHeight"
        :x="-textWidth / 2"
        y="-16"
        fill="#fff"
      />
      <text x="0" y="-16" text-anchor="middle">
        <tspan v-for="(line, i) in splitDisplayName" :key="i"
          x="0" dy="1.2em"
          text-anchor="middle"
        >
          {{ line }}
        </tspan>
      </text>
    </g>
    <g v-else @click="$emit('click')" >
      <rect
        :width="textWidth * 2"
        :x="-textWidth"
        y="-24"
        height="30"
        fill="#fff"
      />
      <text y="0rem"
        :style="{ fontSize: 30, fill: isSelected ? 'rgb(178, 37, 38)' : '#555' }"
        text-anchor="middle"
      >
        {{ displayName }}
      </text>
    </g>

    <g v-if="showAvatars" class="avatar" @click="$emit('click')" >
      <defs v-if="imageSrc">
        <clipPath :id="clipPathId">
          <circle cx="0" cy="0" :r="radius"/>
        </clipPath>
      </defs>

      <circle v-if="isSelected"
        :style="{ fill: 'rgb(178, 37, 38)' }"
        cx="0"
        cy="0"
        :r="radius + 4"
      />
      <circle
        :style="{ fill: 'white'}"
        cx="0"
        cy="0"
        :r="radius"
      />
      <image
        :href="imageSrc || defaultImage()"
        :xlink:href="imageSrc || defaultImage()"
        :x="-radius"
        :y="-radius"
        :width="diameter"
        :height="diameter"
        :clip-path="`url(#${clipPathId})`"
        :style="avatarStyle"
      />
      <NodeMenuButton
        v-if="!isLoading && showMenuButton"
        :transform="`translate(${0.6 * radius} ${0.6 * radius})`"
        @click="openMenu"
      />
    </g>
    <g v-if="hasUndrawnAscendants" :style="dotsAboveNode">
      <text> ... </text>
    </g>
    <g v-if="hasUndrawnSubtree" :style="dotsUnderNode" @click="toggleNodeCollapse(profileId)" >
      <rect width="40" height="40" y="-20" style="fill: rgba(0,0,0,0);" />
      <text> ...  </text>
    </g>

    <g v-if="isPartner && hasAncestors && !isDuplicate"
      :transform="`translate(${1 * radius - 2} ${radius * -0.5})`"
    >
      <text
        font-size="30"
        font-weight="600"
        cursor="initial"
        style="fill: #000;"
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
    showAvatars: Boolean,
    zooming: Boolean,
    scale: Number
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
      radius: this.isPartner ? PARTNER_RADIUS : RADIUS,
      staticProfile: null,
      isInView: false
    }
  },
  watch: {
    // Recheck which nodes are in view after pannig/zooming
    zooming (newVal) {
      if (!newVal) {
        if (this.isLoading) return
        this.calculateInView()
      }
    },
    // Check if profile is in view once profile has loaded
    profile () {
      if (this.isLoading) return
      this.calculateInView()
    }
  },
  async mounted () {
    this.staticProfile = this.person(this.profileId) || await this.loadPersonMinimal(this.profileId)
  },
  computed: {
    ...mapGetters('person', ['person', 'selectedProfileId', 'isLoadingProfiles']),
    ...mapGetters('whakapapa', ['whakapapaView', 'getImportantRelationship', 'isCollapsedNode', 'getParentIds', 'getRawChildIds', 'getRawPartnerIds', 'isLoadingWhakapapa']),
    ...mapGetters('tree', ['hoveredProfileId', 'getNode', 'getPartnerNode', 'searchedProfileId', 'isLoadingTree']),
    isLoading () {
      return this.isLoadingProfiles || this.isLoadingWhakapapa || this.isLoadingTree
    },
    isCollapsed () {
      if (this.isLoading || !this.isInView) return
      return this.isCollapsedNode(this.profileId)
    },
    isSelected () {
      return this.selectedProfileId === this.profileId || this.searchedProfileId === this.profileId
    },
    profile () {
      if (this.isLoading || !this.isInView) {
        return this.staticProfile
      } else {
        return this.person(this.profileId)
      }
    },
    isDuplicate () {
      if (this.isLoading || !this.isInView) return
      const rule = this.getImportantRelationship(this.profileId)
      if (!rule) return false
      return rule.other.length > 1
      // TODO 2022-02-11 mix - ideally we won't lean on "other". Is there another way to do this?
      // Idea - make a getAllNodes + getAllParterNodes (which doesn't just find the first)
    },
    hasUndrawnSubtree () {
      if (this.isLoading || !this.isInView) return
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
      if (this.isLoading || !this.isInView) return
      return this.getParentIds(this.profileId)
        .filter(id => !this.getNode(id) && !this.getPartnerNode(id))
        .length > 0
    },
    hasAncestors () {
      if (this.isLoading || !this.isInView) return
      return (
        this.getParentIds(this.profileId) > 0 ||
        (this.profile.parents && this.profile.parents.length > 0)
      )
    },
    showMenuButton () {
      if (this.isLoading || !this.isInView) return
      if (this.isPartner) return false
      if (!this.whakapapaView.canEdit) return false
      if (this.isCollapsed) return false
      return this.hoveredProfileId === this.profileId
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
    textWidth () {
      const width = (this.splitDisplayName.join('') || '').length * 8
      return width < 100 ? width : 100
    },
    textHeight () {
      return this.splitDisplayName.length > 1 ? 44 : 22
    },
    avatarStyle () {
      return this.profile.deceased
        ? { filter: 'grayscale(1) sepia(0.2)', opacity: '0.4' }
        : ''
    },
    dotsUnderNode () {
      // centers the three dots underneath a nodes name
      const y = this.isPartner ? 55 : this.splitDisplayName.length > 1 ? 90 : 70

      return {
        fontSize: '22px',
        fontWeight: 600,
        transform: `
          translate(0, ${y}px)
          rotate(90deg)
        `
      }
    },
    dotsAboveNode () {
      const y = this.isPartner ? -57 : -72

      // centers the three dots above a node
      return {
        fontSize: '22px',
        fontWeight: 600,
        transform: `
          translate(0, ${y}px)
          rotate(90deg)
        `
      }
    },
    displayName () {
      return getDisplayName(this.profile)
    },
    splitDisplayName () {
      return !this.displayName.includes(' ')
        ? this.displayName.match(/(.{1,15})/g)
        : this.displayName.match(/(.{1,15})(\s|$)/g)
    }
  },
  methods: {
    ...mapActions('whakapapa', ['toggleNodeCollapse']),
    ...mapActions('tree', ['setMouseEvent', 'setHoveredProfileId']),
    ...mapActions('person', ['loadPersonMinimal', 'setSelectedProfileById']),
    defaultImage () {
      return avatarHelper.defaultImage(false, this.profile.aliveInterval, this.profile.gender, false, true)
    },
    openMenu (e) {
      this.setMouseEvent(e)
      this.setSelectedProfileById(this.profileId)
    },
    setHover (bool = false) {
      if (bool) this.setHoveredProfileId(this.profileId)
      else this.setHoveredProfileId(null)
    },
    calculateInView () {
      // Check zoomed for out dont consider in view
      if (this.scale < 0.22 || !this.$refs.node) {
        this.isInView = false
        return
      }
      const rect = this.$refs.node.getBoundingClientRect()
      const height = window.innerHeight
      const width = window.innerWidth
      // this checks if the node is in the users view window
      this.isInView = rect.top < height &&
        rect.bottom > 0 &&
        rect.left < width &&
        rect.right > 0
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

  &:not(:root) {
    overflow: visible;
  }
  &:hover {
    cursor: pointer;
  }
}
</style>
