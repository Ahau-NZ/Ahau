<template>
  <g id="sub-tree">
    <g v-for="partner in partners" :key="`partner-link-${partner.data.id}`">
      <Link
        v-if="partner.link"
        :link="partner.link"
      />
    </g>
    <g v-for="partner in partners" :key="`partner-${partner.data.id}`">
      <g id="child-group">
        <g v-for="child in partner.children" :key="`partner-child-${child.data.id}`">
          <Link v-if="child.link" :link="child.link"/>
          <SubTree :root="child" :openMenu="openMenu" :changeFocus="changeFocus" />
        </g>
      </g>
      <Node
        v-if="partner.link"
        :node="partner"
        :radius="partnerRadius"
        partner
        @change-focus="changeTreeFocus"
      />
    </g>
    <g id="ghost-partner">
      <g id="child-group">
        <g v-for="child in ghostPartner.children" :key="`partner-child-${child.data.id}`">
          <Link v-if="child.link" :link="child.link"/>
          <SubTree :root="child" :openMenu="openMenu" :changeFocus="changeFocus" />
        </g>
      </g>
    </g>

    <Node :node="root" @open-menu="openContextMenu($event)"/>
  </g>
</template>

<script>
import Node from './Node.vue'
import Link from './Link.vue'

// TODO: better name
import settings from '@/lib/link.js'
import pileSort from 'pile-sort'

export default {
  name: 'SubTree',
  props: {
    root: Object,
    openMenu: Function,
    changeFocus: Function
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
    partnerRadius () {
      return 0.8 * this.radius // ensures the partner node will always be smaller then the main node
    },
    diameter () {
      return this.radius * 2
    },
    profile () {
      return this.root.data
    },
    partners () {
      if (!this.root || !this.root.data.partners) return []

      var len = this.profile.partners.length
      if (len === 1) len = 2

      const midway = len % 2 === 0
        ? len / 2
        : Math.round(len / 2) - 1

      return this.profile.partners
        .map((parent, i) => {
          // used to alternate between left and right
          var sign = i >= midway ? 1 : -1

          // const count = sign === 1 ? ++leftCount : ++rightCount
          const offset = sign === 1
            ? this.radius / 2 // right
            : 0 // left

          const xPos = sign === 1
            ? (i - midway) + 1
            : i - midway

          // how far sideways the partner sits from the root node at 0
          const x = this.root.x + offset + (xPos * this.diameter)
          // if we are negative theres no offset
          // if we are positive - use diameter

          // how far down the partner sits from the root node at 0
          const y = this.root.y + 10

          // partner style
          // NOTE: children of this partner will inherit this style
          const style = {
            fill: 'none',
            stroke: settings.color.getRandomColor(),
            opacity: settings.opacity,
            strokeWidth: settings.thickness
          }

          const yOffset = this.root.y + (i * settings.partner.spacing.y) + this.radius

          return {
            x,
            y,
            children: parent.children
              .filter(partnerChild => this.root.children.some(rootChild => {
                if (!rootChild || !partnerChild) return false
                return rootChild.data.id === partnerChild.id
              })) // filter out children who arent this nodes
              .map(child => this.mapChild({ x, y, center: true, sign, yOffset }, child, style)),
            data: parent,
            link: {
              style,
              // for drawing the link from the root parent to this partner/parent
              d: `
                M ${this.root.x + this.radius}, ${yOffset}
                H ${x + this.partnerRadius}
              `
            }
          }
        })
    },
    ghostPartner () {
      const [children] = pileSort(
        this.root.children || [],
        [(child) => child.data.parents.length === 1] // all children that this node is the only parent of
      )

      const style = {
        fill: 'none',
        stroke: settings.color.default,
        opacity: settings.opacity,
        strokeWidth: settings.thickness
      }

      return {
        id: 'GHOST',
        ghost: true,
        children: children.map(({ data }) => this.mapChild({}, data, style))
      }
    }
  },
  methods: {
    openContextMenu ($event) {
      this.openMenu($event)
    },
    changeTreeFocus ($event) {
      this.changeFocus($event)
    },
    mapChild ({ x = this.root.x, y = this.root.y, center, sign, yOffset }, child, style) {
      // map to their node from the root parent
      const node = this.root.children.find(rootChild => child.id === rootChild.data.id)

      // change the link if they are not related by birth
      const dashed = node.data.relationship.relationshipType !== 'birth'

      if (center) {
        x = x + (-sign * this.radius) - 10
        y = yOffset - this.radius
      }

      return {
        ...node,
        link: {
          style: {
            ...style, // inherits the style from the parent so the links are the same color
            strokeDasharray: dashed ? 2.5 : 0
          },
          d: settings.path( // for drawing a link from the parent to child
            {
              startX: x + this.radius,
              startY: y + this.radius,
              endX: node.x + settings.radius,
              endY: node.y + settings.radius
            },
            settings.branch
          )
        }
      }
    }
  }
}

</script>
