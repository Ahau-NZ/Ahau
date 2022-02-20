<template>
  <g>
    <!-- only draw this for top node -->
    <g v-if="root.data.id === whakapapaView.focus">
      <g v-for="link in secondaryLinks" :key="`l-i-${link.id}`">
        <Link :link="link"/>
      </g>
    </g>

    <!-- links between root node and partners -->
    <g v-for="partner in allPartners.filter(p => p.link) " :key="`partner-link-${partner.data.id}`">
      <Link v-if="partner.link" :link="partner.link" />
    </g>

    <!-- all partners and links to their children -->
    <g v-for="partner in allPartners" :key="`partner-${partner.data.id}`">
      <g class="child-group">
        <g v-for="child in partner.children" :key="`partner-child-${child.data.id}`">
          <Link v-if="child.link" :link="child.link" style="transition: 1s linear;"/>
        </g>
      </g>
      <Node v-if="partner.link"
        :profileId="partner.data.id"
        :x="partner.x"
        :y="partner.y"
        isPartner
        :showAvatars="showAvatars"
        @focus="focus"
      />
    </g>

    <!-- draw all children last to overvoid link overlapping -->
    <g v-for="child in childNodes" :key="`child-${child.data.id}`">
      <Link v-if="child.link" :link="child.link" style="transition: 1s linear;"/>
      <SubTree
        :root="child"
        :changeFocus="changeFocus"
        :centerNode="centerNode"
        :showAvatars="showAvatars"
      />
    </g>

    <!-- this subtree root node -->
    <Node v-if="root.data && root.data.id"
      :profileId="root.data.id"
      :x="root.x"
      :y="root.y"
      :showAvatars="showAvatars"
      @center="centerNode(root)"
      />
  </g>
</template>

<script>
import isEmpty from 'lodash.isempty'
import Node from './Node.vue'
import Link from './Link.vue'

// TODO: better name
import settings from '@/lib/link.js'

import { mapGetters } from 'vuex'

const PARTNER_RADIUS = 0.7 * 50 // NOTE primary definition is in Node.vue
const X_PADDING = 10
const DEFAULT_STYLE = {
  fill: 'none',
  stroke: settings.color.default,
  opacity: settings.opacity,
  strokeWidth: settings.thickness,
  strokeLinejoin: 'round'
}

export default {
  name: 'SubTree',
  props: {
    root: Object,
    changeFocus: Function,
    centerNode: Function,
    showAvatars: Boolean
  },
  components: {
    Node,
    Link
  },
  data () {
    return {
      radius: 50
    }
  },
  computed: {
    ...mapGetters('whakapapa', [
      'whakapapaView', 'isCollapsedNode', 'showExtendedFamily',
      'getChildIds', 'getParentIds', 'getPartnerIds', 'getPartnerRelationshipType', 'getChildRelationshipType'
    ]),
    ...mapGetters('tree', ['secondaryLinks']),
    allPartners () {
      return [
        ...this.partnerNodes,
        ...this.ghostPartner
      ]
    },
    diameter () {
      return this.radius * 2
    },
    profileId () {
      return this.root.data.id
    },
    isCollapsed () {
      return this.isCollapsedNode(this.profileId)
    },
    childNodes () {
      if (this.isCollapsed) return []

      return this.root.children || []
    },
    partnerNodes () {
      if (this.isCollapsed) return []

      const partnerIds = this.getPartnerIds(this.profileId)
      if (isEmpty(partnerIds)) return []

      let len = partnerIds.length
      if (len === 1) len = 2

      const midway = len % 2 === 0
        ? len / 2
        : Math.round(len / 2) - 1

      return this.mapPartnerNodes(partnerIds, midway)
    },
    // Needed to draw links between parents and children where the root node is the only parent of that child node
    ghostPartner () {
      // find the children of this node that only parents who are solo
      // (could have multiple parents but not in relationship with node)
      const children = this.childNodes.filter(childNode => {
        const parentIds = this.getParentIds(childNode.data.id)
        if (parentIds.length === 1) return parentIds[0] === this.profileId

        return parentIds.filter(parentId => parentId !== this.profileId)
          .every(parentId => this.getPartnerRelationshipType(parentId, this.profileId) === undefined)
      })
      if (children.length === 0) return [] // don't render if not needed

      const yOffset = this.root.y + (this.partnerNodes.length * settings.partner.spacing.y)

      return [{
        data: {
          id: 'GHOST'
        },
        ghost: true,
        children: children.map(({ data }) => this.mapChild({ y: yOffset }, data.id, DEFAULT_STYLE, this.profileId, true))
      }]
    }
  },
  methods: {
    mapPartnerNodes (partnerIds, midway) {
      var leftPartners = 0
      var rightPartners = 0

      return partnerIds.map((partnerId, i) => {
        // set partners to alternate sides
        let sign = (i >= midway) ? 1 : -1

        let partnerChildIds = this.getChildIds(partnerId)

        // If the partnerId has children find where they are positioned and place the partnerId on the correct side
        if (partnerChildIds.length) {
          const partnersChildNodes = partnerChildIds
            .map(partnerChildId => this.childNodes.find(node => node.data.id === partnerChildId))
            .filter(Boolean) // filters out empty entries

          const averageX = (
            partnersChildNodes.reduce((acc, childNode) => acc + childNode.x, 0) /
            partnersChildNodes.length
          )

          if (averageX) sign = (averageX > this.root.x) ? 1 : -1
        }

        // keep a count of the partners on each side
        if (sign === 1) rightPartners++
        else leftPartners++

        const offset = sign === 1
          ? this.diameter - 2 * PARTNER_RADIUS // right
          : 0 // left

        const xMultiplier = sign === 1
          ? rightPartners
          : -leftPartners

        // how far sideways the partner sits from the root node at 0
        const x = this.root.x + offset + xMultiplier * (this.diameter - 10)

        // how far down the partner sits from the root node at 0
        const y = this.root.y + this.radius - PARTNER_RADIUS

        // partner style
        // NOTE: children of this partner will inherit this style
        const style = {
          ...DEFAULT_STYLE,
          stroke: settings.color.getColor(i)
        }

        // start point of the partner node links on the Y axist
        const yOffset = this.root.y + (i * settings.partner.spacing.y) + this.radius
        const xOffset = xMultiplier * X_PADDING

        let link = {}
        const rel = this.getPartnerRelationshipType(this.profileId, partnerId)
        const isPartnersPlus = ['partners', 'inferred'].includes(rel)
        // "plus" because includes inferred
        if (isPartnersPlus) {
          link = {
            style: {
              ...DEFAULT_STYLE,
              stroke: settings.color.getColor(i),
              strokeDasharray: rel === 'inferred' ? 4 : 0 // for drawing a isDashed link
            },
            // for drawing the link from the root partner to this partner/partner
            d: `
              M ${this.root.x + this.radius}, ${yOffset}
              H ${x + PARTNER_RADIUS}
            `
          }
        }

        if (!this.showExtendedFamily) {
          partnerChildIds = partnerChildIds.filter(childId => {
            return this.childNodes.some(childNode => {
              return (childNode.data.id === childId)
            })
          }) // filter out children who arent this nodes
        }

        return {
          x,
          y,
          children: partnerChildIds
            .map(childId => this.mapChild({ x, y, sign, center: isPartnersPlus, yOffset, xOffset }, childId, style, partnerId))
            .filter(Boolean),
          data: { id: partnerId },
          link
        }
      })
    },
    focus ($event) {
      this.changeFocus($event)
    },
    mapChild ({ x = this.root.x, y = this.root.y, center, sign, yOffset, xOffset }, childId, style, parentId, isGhost = false) {
      // map to their node from the root parent
      const node = this.childNodes.find(childNode => childId === childNode.data.id)
      if (!node || !node.data) return

      const isNonChild = this.getChildRelationshipType(this.profileId, childId) === undefined
      if (isNonChild) center = false
      // TODO 2022-02-15 mix - I think I've replaced this correctly, but not sure

      const relationshipType = this.getChildRelationshipType(parentId, childId)
      // dash link if they are not related by adopted/whangai
      const isDashed = ['adopted', 'whangai'].includes(relationshipType)

      // center the link between the parents
      if (center) {
        x = x - this.radius + PARTNER_RADIUS - sign * (PARTNER_RADIUS + 10)// end constant is dependant on radius, PARTNER_RADIUS, X_PADDING
        y = yOffset - this.radius
      }

      // offcenter links to avoid overlapping with partner or main parent node links
      let offCenter = !isGhost && !center

      return {
        ...node,
        link: {
          style: {
            ...style, // inherits the style from the parent so the links are the same color
            strokeDasharray: isDashed ? 2.5 : 0 // for drawing a isDashed link to represent adopted/whangai
          },
          d: settings.path( // for drawing a link from the parent to child
            {
              startX: offCenter ? x + PARTNER_RADIUS : x + this.radius,
              startY: offCenter ? yOffset + 10 : y + this.radius,
              endX: offCenter ? node.x + this.radius + xOffset : node.x + this.radius,
              endY: node.y + this.radius
            },
            settings.branch
          )
        }
      }
    }
  }
}

</script>
