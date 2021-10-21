<template>
  <g>

    <!-- links between root node and partners -->
    <g v-for="partner in allPartners" :key="`partner-link-${partner.data.id}`">
      <Link
        v-if="partner.link"
        :link="partner.link"
      />
    </g>

    <!-- all partners and links to their children -->
    <g v-for="partner in allPartners" :key="`partner-${partner.data.id}`">
      <g class="child-group">
        <g v-for="child in partner.children" :key="`partner-child-${child.data.id}`">
          <Link v-if="child.link" :link="child.link" style="transition: 1s linear;"/>
        </g>
      </g>
      <Node
        v-if="partner.link"
        :node="partner"
        :radius="partnerRadius"
        isPartner
        @focus="focus"
        :showAvatars="showAvatars"
        :showPartners="showPartners"
      />
    </g>

    <!-- draw all children last to overvoid link overlapping -->
    <g v-for="child in children" :key="`child-${child.data.id}`">
      <Link v-if="child.link" :link="child.link" style="transition: 1s linear;"/>
      <SubTree
        :root="child"
        :openMenu="openMenu"
        :changeFocus="changeFocus"
        :centerNode="centerNode"
        :nodeCentered="nodeCentered"
        :showAvatars="showAvatars"
        :showPartners="showPartners"
      />
    </g>

    <!-- this subtree root node -->
    <Node :node="root" @open-menu="openContextMenu($event)" @center="center" :showAvatars="showAvatars" :showPartners="showPartners"/>
  </g>
</template>

<script>
import Node from './Node.vue'
import Link from './Link.vue'

// TODO: better name
import settings from '@/lib/link.js'
import pileSort from 'pile-sort'
import mapProfileMixins from '@/mixins/profile-mixins.js'

const PARTNER_SHRINK = 0.7
const X_PADDING = 10

export default {
  name: 'SubTree',
  props: {
    root: Object,
    openMenu: Function,
    changeFocus: Function,
    centerNode: Function,
    nodeCentered: String,
    showPartners: Boolean,
    showAvatars: Boolean
  },

  mixins: [
    mapProfileMixins({
      mapMethods: ['getProfile']
    })
  ],
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
    allPartners () {
      return [
        ...this.partners,
        this.ghostPartner
      ]
    },
    partnerRadius () {
      return PARTNER_SHRINK * this.radius // ensures the partner node will always be smaller then the main node
    },
    diameter () {
      return this.radius * 2
    },
    profile () {
      return this.root.data
    },
    children () {
      if (this.profile.isCollapsed) return []
      return this.root.children || []
    },
    partners () {
      if (!this.root || !this.profile.partners || this.profile.isCollapsed || !this.showPartners) return []

      var len = this.profile.partners.length
      if (len === 1) len = 2

      const midway = len % 2 === 0
        ? len / 2
        : Math.round(len / 2) - 1

      return this.mapPartnerNodes(this.profile.partners, midway)
    },
    // Needed to draw links between parents and children outside of a partnership
    ghostPartner () {
      let partners = this.partners
        .filter(partner => !partner.data.isNonPartner)
        .map(partner => partner.data.id)

      const [children, otherChildren] = pileSort(
        this.children,
        [
          (child) => (child.data.parents && child.data.parents.length === 1) || partners.length === 0, // all children that this node is the only parent of
          (child) => {
            let parentIds = child.data.parents.map(parent => { return parent.id })
            return (
              parentIds.length > 1 && // the child has two or more parents
              //  none of their other parents are a partner of the root node
              !partners.some(id => parentIds.includes(id))
            )
          }
        ]
      )

      const style = {
        fill: 'none',
        stroke: settings.color.default,
        opacity: settings.opacity,
        strokeWidth: settings.thickness,
        strokeLinejoin: 'round'
      }

      var totalPartners = this.partners.length
      const allChildren = [...children, ...otherChildren]

      const yOffset = this.root.y + (totalPartners * settings.partner.spacing.y)

      return {
        data: {
          id: 'GHOST'
        },
        ghost: true,
        children: allChildren.map(({ data }) => this.mapChild({ y: yOffset }, data, style, null, true))
      }
    }
  },
  methods: {
    openContextMenu ({ event, profile }) {
      // NOTE: this where we will handle which parent to use for addPerson/processUpdate in DialogHandler
      profile.parent = this.root.parent ? this.root.parent.data : null

      this.openMenu({ event, profile })
    },
    mapPartnerNodes (nodes, midway) {
      var leftPartners = 0
      var rightPartners = 0

      return nodes.map((partner, i) => {
        // set partners to alternate sides
        let sign = i >= midway ? 1 : -1

        // If the partner has children find where they are positioned and place the partner on the correct side
        if (partner.children.length) {
          const childrenX = []
          partner.children.forEach(child => {
            let node = this.root.children.find(rootChild => child.id === rootChild.data.id)
            if (node) childrenX.push(node.x)
          })
          var average = childrenX.reduce((a, b) => a + b, 0) / childrenX.length
          if (average) sign = average > this.root.x ? 1 : -1
        }

        // keep a count of the partners on each side
        if (sign === 1) rightPartners++
        else leftPartners++

        const offset = sign === 1
          ? this.diameter - 2 * this.partnerRadius // right
          : 0 // left

        const xMultiplier = sign === 1
          ? rightPartners
          : -leftPartners

        // how far sideways the partner sits from the root node at 0
        const x = this.root.x + offset + xMultiplier * (this.diameter - 10)

        // how far down the partner sits from the root node at 0
        const y = this.root.y + this.radius - this.partnerRadius

        // partner style
        // NOTE: children of this partner will inherit this style
        const style = {
          fill: 'none',
          stroke: settings.color.getColor(i),
          opacity: settings.opacity,
          strokeWidth: settings.thickness,
          strokeLinejoin: 'round'
        }

        // start point of the partner node links on the Y axist
        const yOffset = this.root.y + (i * settings.partner.spacing.y) + this.radius

        const xOffset = xMultiplier * X_PADDING

        const link = partner.isNonPartner ? {} : {
          style,
          // for drawing the link from the root partner to this partner/partner
          d: `
            M ${this.root.x + this.radius}, ${yOffset}
            H ${x + this.partnerRadius}`
        }

        if (!this.showPartners) {
          partner.children = partner.children
            .filter(partnerChild => {
              return (
                this.children &&
                this.children.some(rootChild => {
                  if (!rootChild || !partnerChild) return false
                  return (rootChild.data.id === partnerChild.id)
                })
              )
            }) // filter out children who arent this nodes
        }

        return {
          x,
          y,
          children: partner.children
            .filter(partnerChild => {
              return (
                this.children &&
                this.children.some(rootChild => {
                  if (!rootChild || !partnerChild) return false
                  return (rootChild.data.id === partnerChild.id)
                })
              )
            }) // filter out children who arent this nodes
            .map(child => this.mapChild({ x, y, sign, center: !partner.isNonPartner, yOffset, xOffset }, child, style, partner, false)),
          data: partner,
          link
        }
      })
    },
    focus ($event) {
      this.changeFocus($event)
    },
    center ($event) {
      this.centerNode($event)
    },
    mapChild ({ x = this.root.x, y = this.root.y, center, sign, yOffset, xOffset }, child, style, parent, ghostParent) {
      // map to their node from the root parent
      const node = this.root.children.find(rootChild => child.id === rootChild.data.id)

      // change the link if they are not related by birth
      const dashed = parent && parent.relationshipType ? ['adopted', 'whangai'].includes(parent.relationshipType) : ['adopted', 'whangai'].includes(node.data.relationshipType)

      // center the link between the parents
      if (center) {
        x = x - this.radius + this.partnerRadius - sign * (this.partnerRadius + 10)// end constant is dependant on radius, partnerRadius, X_PADDING
        y = yOffset - this.radius
      }

      // offcenter links to avoid overlapping with partner or main parent node links
      let offCenter = !ghostParent && !center

      return {
        ...node,
        link: {
          style: {
            ...style, // inherits the style from the parent so the links are the same color
            strokeDasharray: dashed ? 2.5 : 0 // for drawing a dashed link to represent adopted/whangai
          },
          d: settings.path( // for drawing a link from the parent to child
            {
              startX: offCenter ? x + this.partnerRadius : x + this.radius,
              startY: offCenter ? yOffset : y + this.radius,
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
