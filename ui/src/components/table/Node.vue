<template>
<svg :width="width - 50">
  <g
    :id="node.id"
    :transform="`translate(${node.x}, ${node.y})`"
  >
    <g
      class="avatar -main"
      @mouseover="hover = true"
      @mouseleave="hover = false"
      @click.prevent="click"
      @mousedown.right="openMenu"
      @contextmenu.prevent
    >
      <!-- Avatar -->
      <defs>
        <clipPath id="myCircle">
          <circle :cx="radius" :cy="radius" :r="radius" />
        </clipPath>
      </defs>
      <circle
        :style="{fill: profile.deceased ? colours.deceased : colours.alive }"
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
      <NodeMenuButton
        v-if="showMenuButton"
        :transform="`translate(${1.4 * radius}, ${1.4 * radius})`"
        @click="openMenu"
      />
    </g>
    <!-- Names -->
    <g v-if="!isPartner" id="node-label" :style="textStyle">
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
import { mapGetters, mapActions } from 'vuex'
import get from 'lodash.get'
import avatarHelper from '@/lib/avatar-helpers.js'
import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants.js'
import { getDisplayName } from '@/lib/person-helpers.js'
import NodeMenuButton from '../tree/NodeMenuButton.vue'
// import flower.svg from '@/src/assets'

export default {
  name: 'TableNode',
  props: {
    node: { type: Object, required: true },
    radius: { type: Number, required: true },
    isPartner: { type: Boolean, default: false },
    hideLabel: { type: Boolean, default: false },
    width: { type: Number, required: true }
  },
  components: {
    NodeMenuButton
  },
  data () {
    return {
      hover: false,
      offsetSize: 15,
      colours: {
        alive: ALIVE_COLOUR,
        deceased: DECEASED_COLOUR
      }
    }
  },
  async mounted () {
    await this.loadPersonFull(this.profileId)
  },
  computed: {
    ...mapGetters('whakapapa', ['isCollapsedNode']),
    mobile () {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm
    },
    profileId () {
      return this.profile.id
    },
    profile () {
      if (this.isPartner) return this.node
      return this.node.data
    },
    isCollapsed () {
      return this.isCollapsedNode(this.profileId)
    },
    showMenuButton () {
      return (!this.isCollapsed && this.hover)
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
    }
  },
  methods: {
    ...mapActions('tree', ['setMouseEvent']),
    ...mapActions('person', ['setSelectedProfileById', 'loadPersonFull']),
    getDisplayName,
    click () {
      if (!this.isPartner) this.$emit('center')
    },
    openMenu (e) {
      this.setMouseEvent(e)
      this.setSelectedProfileById(this.profileId)
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
