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
          <SubTree :root="child"/>
        </g>
      </g>
      <Node
        v-if="partner.link"
        :node="partner"
        :radius="partnerRadius"
        partner
      />
    </g>

    <Node :node="root"/>
  </g>
</template>

<script>
import Node from './Node.vue'
import Link from './Link.vue'

// TODO: better name
import settings from '@/lib/link.js'

export default {
  name: 'SubTree',
  props: {
    root: Object
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

      var leftCount = 0
      var rightCount = 0

      return this.profile.partners
        .map((parent, i) => {
          // used to alternate between left and right
          var sign = i % 2 === 0 ? -1 : 1
          const count = sign === 1 ? ++leftCount : ++rightCount
          const offset = sign === 1
            ? this.diameter + this.partnerRadius / 2 // right
            : this.diameter // left

          // how far sideways the partner sits from the root node at 0
          const x = this.root.x + (sign * offset) * count
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

          return {
            x,
            y,
            children: parent.children
              .filter(partnerChild => this.root.children.some(rootChild => rootChild.data.id === partnerChild.id)) // filter out children who arent this nodes
              .map(child => {
                // map to their node from the root parent
                const node = this.root.children.find(rootChild => child.id === rootChild.data.id)

                // change the link if they are not related by birth
                const dashed = node.data.relationship.relationshipType !== 'birth'

                return {
                  ...node,
                  link: {
                    style: {
                      ...style, // inherits the style from the parent so the links are the same color
                      strokeDasharray: dashed ? 2.5 : 0
                    },
                    d: settings.path( // for drawing a link from the parent to child
                      {
                        startX: this.root.x + this.radius,
                        startY: this.root.y + this.radius,
                        endX: node.x + settings.radius,
                        endY: node.y + settings.radius
                      },
                      settings.branch
                    )
                  }
                }
              }),
            data: parent,
            link: {
              style,
              // for drawing the link from the root parent to this partner/parent
              d: `
                M ${this.root.x + this.radius}, ${this.root.y + (i * settings.partner.spacing.y) + this.radius}
                H ${x + this.partnerRadius}
              `
            }
          }
        })
    }
  }
}

</script>
