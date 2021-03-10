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
      </g>
      <g v-for="child in children" :key="`child-${child.data.id}`" id="childGroup">
        <SubTree :root="child" />
        <!-- <Link :link="child.link"/> -->
      </g>
    </g>
    <!-- we draw the node second so the links appear underneath -->

    <!-- Children -->
  </g>
</template>

<script>
import Node from './Node.vue'
import Link from './Link.vue'
import pileSort from 'pile-sort'

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
    children () {
      if (!this.root || !this.root.children) return []

      // // get all partner ids
      const partnerIds = this.profile.partners.map(d => d.id)
      const filters = []

      partnerIds.forEach(id => {
        filters.push((child) => child.data.parents.some(p => p.id === id))
      })

      if (filters.length === 0) {
        // children without a second parent
        if (this.root.children.length > 0) return this.root.children
        else return []
      }

      const piles = pileSort(
        this.root.children,
        filters
      )

      if (piles.length === 0) return []

      let arr = []

      piles.forEach(d => {
        arr = [...arr, ...d]
      })

      return arr.map((d, i) => {
        const { x, y } = this.root.children[i]

        return {
          ...d,
          x,
          y
        }
      })
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

          const startX = x + PARTNER_RADIUS
          const endX = this.root.x + NODE_RADIUS

          return {
            index: i,
            x,
            y,
            data: partner,
            link: {
              d: `
                M ${startX}, ${this.root.y + NODE_RADIUS + (i * 3)}
                H ${endX}
              `,
              style: {
                fill: 'none',
                stroke: colours[Math.floor(Math.random() * colours.length)],
                opacity: 0.7,
                strokeWidth: 2
              }
            }
            // children: CHILDREN.map((child, ci) => {
            //   return {
            //     ...child,
            //     x: child.x,
            //     y: child.y,
            //     link: {
            //       d: `
            //         M ${x + PARTNER_RADIUS}, ${y + PARTNER_RADIUS}
            //         v ${100}
            //         H ${child.x + NODE_RADIUS}
            //         V ${child.y + NODE_RADIUS}
            //       `,
            //       style: {
            //         fill: 'none',
            //         stroke: 'darkgrey'
            //       }
            //     }
            //   }
            // })
          }
        })
        .reverse()
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

/*
  TODO:
  - [ ] reorder children by partner/parents

  - display partner above children
  - what happens when a child belongs to three parents?
*/
</script>
