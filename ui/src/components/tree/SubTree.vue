<template>
  <g id="sub-tree">
    <g v-for="partner in partners" :key="`partner-link-${partner.data.id}`">
      <Link
        v-if="partner.link"
        :link="partner.link"
      />
    </g>
    <g v-for="partner in partners" :key="`partner-children-${partner.data.id}`">
      <g id="child-group">
        <g v-for="child in partner.children" :key="`partner-child-${child.data.id}`">
          <Link v-if="child.link" :link="child.link"/>
          <SubTree :root="child"/>
        </g>
      </g>
      <Node
        v-if="partner.link"
        :node="partner"
        :radius="40"
        partner
      />
    </g>
    <Node :node="root" />
  </g>
</template>

<script>
import Node from './Node.vue'
import Link from './Link.vue'

import uniqby from 'lodash.uniqby'
import pileSort from 'pile-sort'

const NODE_RADIUS = 50
const PARTNER_RADIUS = 40

const NODE_DIAMETER = NODE_RADIUS * 2
const PARTNER_DIAMETER = PARTNER_RADIUS * 2
const DIFF = NODE_DIAMETER - PARTNER_DIAMETER

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
      offsetSize: 15,
      partnerRadius: 0.8 * 50
    }
  },
  computed: {
    position () {
      return {
        transform: `translate(${this.root.x}px, ${this.root.y}px)`,
        single: []
      }
    },
    profile () {
      return this.root.data
    },
    partners () {
      if (!this.profile || !this.profile.partners) return []

      var [single, multiple] = pileSort(
        this.root.children || [],
        [(child) => child.data.parents.length === 1] // children who only have one parent (the root node)
      )

      var allChildren = []
      var currentChildren = []

      var partners = this.profile.partners
        .map((partner, i) => {
          var x = this.root.x + ((i + 1) * NODE_DIAMETER) + DIFF
          const y = this.root.y + (DIFF / 2)
          var sign = (i % 2 === 0) ? 1 : -1

          if (i === 0) x = this.root.x - PARTNER_RADIUS * 3
          if (i === 1) x = this.root.x + PARTNER_RADIUS * 3
          if (i > 2) x = sign * x

          const startX = x + PARTNER_RADIUS
          const startY = this.root.y + NODE_RADIUS + (i * 3)
          const endX = this.root.x + NODE_RADIUS

          const children = partner.children
            .filter(child => {
              return this.root.children.some(c => child.id === c.data.id)
            })

          allChildren.push(...children)
          allChildren = uniqby(allChildren, (child) => child.id)

          return {
            x,
            y,
            data: partner,
            link: {
              startX,
              startY,
              d: `
                M ${startX}, ${startY}
                H ${endX}
              `,
              style: {
                fill: 'none',
                stroke: '#' + Math.random().toString(16).substr(2, 6),
                opacity: 0.3,
                strokeWidth: 5
              }
            },
            children
          }
        })
        .map((partner, i) => {
          partner.children = uniqby(partner.children, (child) => child.id)

          partner.children = partner.children
            .map(child => {
              const node = this.root.children.find(d => d.data.id === child.id)
              const index = allChildren.indexOf(child)
              var { x } = this.root.children[index]

              var offset = 0

              if (allChildren.length === 1) {
                x = this.root.x
              } else if (currentChildren.indexOf(child) >= 0) {
                offset = 10
              } else {
                currentChildren.push(child)
              }

              return {
                ...node,
                x,
                link: {
                  style: partner.link.style,
                  d: `
                    M ${partner.x + PARTNER_RADIUS}, ${partner.link.startY}
                    v ${120 - (i * 3)}
                    H ${x + NODE_RADIUS + offset}
                    V ${node.y + NODE_RADIUS}
                  `
                }
              }
            })
          return partner
        })

      // add the other children
      var i = multiple.length

      single = single.map(d => {
        var { x } = this.root.children[i]

        if (i === 0) x = this.root.x

        i += 1

        return {
          link: false,
          ...d,
          x
          // TODO link for these
        }
      })

      const ghost = {
        link: false,
        data: {
          id: this.root.data.id + '-ghost-partner'
        },
        children: single
      }

      partners.push(ghost)

      return partners
    }
  }
}

</script>
