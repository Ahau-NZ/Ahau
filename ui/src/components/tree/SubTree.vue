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

import uniqby from 'lodash.uniqby'
import pileSort from 'pile-sort'

// TODO: better name
import link from '@/lib/link.js'

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
      radius: 50,
      branch: 120
    }
  },
  computed: {
    partnerRadius () {
      return 0.8 * this.radius // ensures the partner node will always be smaller then the main node
    },
    diameter () {
      return this.radius * 2
    },
    partnerDiameter () {
      return this.partnerRadius * 2
    },
    diameterDiff () {
      return this.diameter - this.partnerDiameter
    },
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

      var [singleParentChildren, otherChildren] = pileSort(
        this.root.children || [],
        [(child) => child.data.parents.length === 1] // children who only have one parent (the root node)
      )

      var allChildren = []
      var currentChildren = []

      var partners = this.profile.partners
        .map((parent, i) => {
          var x = this.root.x + ((i + 1) * this.diameter) + this.diameterDiff
          const y = this.root.y + (this.diameterDiff / 2)
          var sign = (i % 2 === 0) ? 1 : -1

          if (i === 0) x = this.root.x + ((-1 * this.partnerRadius) * 3)
          if (i === 1) x = this.root.x + (this.partnerRadius * 3) + 20
          if (i > 2) x = sign * x

          const startX = x + this.partnerRadius
          const startY = this.root.y + this.radius + (i * 3)
          const endX = this.root.x + this.radius

          // we only care about the children that are this nodes children
          const children = parent.children
            .filter(child => {
              return this.root.children.some(c => child.id === c.data.id)
            })

          allChildren.push(...children)
          allChildren = uniqby(allChildren, (child) => child.id)

          return {
            x,
            y,
            data: parent,
            link: {
              startY,
              d: `
                M ${startX}, ${startY}
                H ${endX}
              `,
              style: link.style.random()
            },
            children
          }
        })
        .map((parent, i) => {
          var sign = (i % 2 === 0) ? 1 : -1
          parent.children = uniqby(parent.children, (child) => child.id)

          parent.children = parent.children
            .map(child => {
              const node = this.root.children.find(d => d.data.id === child.id)
              const index = allChildren.indexOf(child)
              var { x } = this.root.children[index]

              var offset = 0

              if (allChildren.length === 1) {
                // this is for a child who is an only child
                x = this.root.x
                offset = i * 7
              } else if (currentChildren.indexOf(child) >= 0) {
                // this is for a child who has more than 2 parents
                offset = i * 7
              } else {
                currentChildren.push(child)
              }

              return {
                ...node,
                x,
                link: {
                  style: parent.link.style, // inherits the style from the parent
                  d: link.path(
                    {
                      startX: parent.x + this.partnerRadius,
                      startY: parent.link.startY,
                      endX: x + this.radius + (-sign * offset),
                      endY: node.y + this.radius
                    },
                    this.branch - (i * 10)
                  )
                }
              }
            })
          return parent
        })

      var len = otherChildren.length
      var i = len

      singleParentChildren = singleParentChildren.map(child => {
        var node = this.root.children[i]

        if (i === 0) node.x = this.root.x
        i += 1

        return {
          link: {
            style: link.style.default,
            d: link.path(
              {
                startX: this.root.x + this.radius,
                startY: this.root.y + this.radius,
                endX: node.x + this.radius,
                endY: node.y + this.radius
              },
              this.branch - (len * 3.5)
            )
          },
          ...child,
          x: node.x
        }
      })

      // a non-visible partner so the children of this node who have no second parent
      // can still be visible
      const ghost = {
        data: {
          id: this.root.data.id + '-ghost-partner'
        },
        children: singleParentChildren
      }

      partners.push(ghost)

      return partners.reverse()
    }
  }
}

</script>
