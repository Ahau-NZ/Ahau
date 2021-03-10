<template>
  <g>
    <Node :node="root"/>
    <!-- Partners -->
    <g>
      <g v-for="partner in partners" :key="partner.id">
        <Node
          :node="partner"
          :radius="40"
          partner
        />
        <Link
          :link="partner.link"
        />
        
        <g v-for="child in partner.children" :key="`partner-${partner.data.id}-child-${child.data.id}`">
          
          <SubTree :root="child" />
          <Link :link="child.link"/>
        </g>
        
      </g>
    </g>
    <!-- we draw the node second so the links appear underneath -->
    
    <!-- Children -->
  </g>
</template>

<script>
import Node from './Node.vue'
import Link from './Link.vue'

import { colours } from '@/lib/colours.js'

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

      return this.profile.partners
        .map((partner, i) => {
          const NODE_RADIUS = 50
          const PARTNER_RADIUS = 40
          const NODE_DIAMETER = NODE_RADIUS * 2
          const PARTNER_DIAMETER = PARTNER_RADIUS * 2
          const DIFF = NODE_DIAMETER - PARTNER_DIAMETER

          const x = this.root.x + ((i + 1) * NODE_DIAMETER) + DIFF
          const y = this.root.y + (DIFF / 2)

          console.log(this.profile.preferredName, i, x, y)

          const CHILDREN = this.getChildrenByPartner(partner)

          return {
            index: `${this.profile.id}-partner-${i}`,
            x,
            y,
            data: partner,
            link: {
              d: `
                M ${x + PARTNER_RADIUS}, ${this.root.y + NODE_RADIUS}
                H ${this.root.x + NODE_RADIUS}
              `,
              style: {
                fill: 'none',
                stroke: colours[Math.floor(Math.random() * colours.length)],
                opacity: 0.7,
                strokeWidth: 10
              }
            },
            children: CHILDREN.map((child, ci) => {
              return {
                ...child,
                x: child.x,
                y: child.y,
                link: {
                  d: `
                    M ${x + PARTNER_RADIUS}, ${y + PARTNER_RADIUS}
                    v ${100}
                    H ${child.x + NODE_RADIUS}
                    V ${child.y + NODE_RADIUS}
                  `,
                  style: {
                    fill: 'none',
                    stroke: 'darkgrey'
                  }
                }
              }
            })
          }
        })
        .reverse()
    },
    children () {
      return this.root.children
    }
  },
  methods: {
    getChildrenByPartner (partner) {
      if (!partner) return []

      console.log(partner)
      if (!this.root || !this.root.children) return []

      return this.root.children
        .filter(child => {
          return partner.children.some(c => {
            return c.id === child.data.id
          })
        })
    }
  }
}
</script>
