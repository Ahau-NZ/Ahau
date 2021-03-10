<template>
  <g>
    <g>
      <g v-for="partner in partners" :key="`partner-link-${partner.data.id}`">
        <Link
          :link="partner.link"
        />
      </g>
      <g v-for="partner in partners" :key="`partner-children-${partner.data.id}`">
        <g v-for="child in partner.children" :key="`partner-child-${child.data.id}`" id="childGroup">
          <Link :link="child.link"/>
          <SubTree :root="child" />
        </g>
        <!--  -->
        <Node
          :node="partner"
          :radius="40"
          partner
        />
      </g>
    </g>
    <Node :node="root"/>
  </g>
</template>

<script>
import Node from './Node.vue'
import Link from './Link.vue'

const NODE_RADIUS = 50
const PARTNER_RADIUS = 40

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
        transform: `translate(${this.root.x}px, ${this.root.y}px)`
      }
    },
    profile () {
      return this.root.data
    },
    partners () {
      if (!this.profile || !this.profile.partners) return []

      var allChildren = []

      return this.profile.partners
        .map((partner, i) => {
          const NODE_RADIUS = 50
          const PARTNER_RADIUS = 40
          const NODE_DIAMETER = NODE_RADIUS * 2
          const PARTNER_DIAMETER = PARTNER_RADIUS * 2
          const DIFF = NODE_DIAMETER - PARTNER_DIAMETER

          const x = this.root.x + ((i + 1) * NODE_DIAMETER) + DIFF
          const y = this.root.y + (DIFF / 2)

          const startX = x + PARTNER_RADIUS
          const startY = this.root.y + NODE_RADIUS + (i * 3)
          const endX = this.root.x + NODE_RADIUS

          const children = partner.children
            .filter(child => {
              return this.root.children.some(c => child.id === c.data.id)
            })

          allChildren.push(...children)

          return {
            index: i,
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
                opacity: 0.4,
                strokeWidth: 2.5
              }
            },
            children
          }
        })
        .map(partner => {
          partner.children = partner.children.map(child => {
            const node = this.root.children.find(d => d.data.id === child.id)

            return {
              ...node,
              link: {
                style: {
                  ...partner.link.style,
                  opacity: partner.link.style.opacity
                },
                d: `
                  M ${partner.x - (PARTNER_RADIUS / 3)}, ${partner.link.startY + 1}
                  v ${120}
                  H ${node.x + NODE_RADIUS}
                  V ${node.y + NODE_RADIUS}
                `
              }
            }
          })
          return partner
        })
    }
  }
}

</script>
