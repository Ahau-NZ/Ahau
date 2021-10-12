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
        partner
        @focus="focus"
        :showAvatars="showAvatars"
        :showParents="showParents"
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
        :showParents="showParents"
        :findInTree="findInTree"
        :duplicateProfiles="duplicateProfiles"
      />
    </g>

    <!-- this subtree root node -->
    <Node :node="root" @open-menu="openContextMenu($event)" @center="center" :showAvatars="showAvatars" :showParents="showParents"/>
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
const X_PADDING = 15

export default {
  name: 'SubTree',
  props: {
    root: Object,
    openMenu: Function,
    changeFocus: Function,
    centerNode: Function,
    nodeCentered: String,
    showParents: Boolean,
    showAvatars: Boolean,
    findInTree: Function,
    duplicateProfiles: Array
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
    // hasCenteredChild () {
    //   if (!this.root || !this.root.children || !this.root.children.length) return false

    //   return this.root.children.some(child => child.data.id === this.nodeCentered)
    // },
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
      return this.root.children
    },
    partners () {
      if (!this.root || !this.profile.partners || this.profile.isCollapsed || !this.showParents) return []

      var len = this.profile.partners.length
      if (len === 1) len = 2

      const midway = len % 2 === 0
        ? len / 2
        : Math.round(len / 2) - 1


      return this.mapNodes(this.profile.partners, midway, false)
    },
    // Needed to draw links between parents and children outside of a partnership
    ghostPartner () {
      let partners = this.partners.filter(partner => !partner.data.isNonPartner).map(partner => { return partner.data.id })
      const [children, otherChildren] = pileSort(
        this.root.children || [],
        [
          (child) => (child.data.parents && child.data.parents.length === 1) || partners.length === 0, // all children that this node is the only parent of
          (child) => {
            let parentIds = child.data.parents.map(parent => { return parent.id })
            return (
              child.data.parents &&
              child.data.parents.length > 1 && // the child has two or more parents
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
    // TODO:  Remove if doesnt do anything
    // getParentChildren (id) {
    //   if (!this.root || !this.root.children) return []
    //   return this.root.children
    //     .filter(child => child.data.parents.some(parent => parent.id === id))
    //     .map(child => child.data)
    // },

    openContextMenu ({ event, profile }) {
      // NOTE: this where we will handle which parent to use for addPerson/processUpdate in DialogHandler
      profile.parent = this.root.parent ? this.root.parent.data : null

      this.openMenu({ event, profile })
    },
    mapNodes (nodes, midway) {
      return nodes.map((parent, i) => {
        // if the partner is a duplicate profile and the partners link profile is the root node
        // if (this.duplicateProfiles.some(d => d.id === parent.id && d.linkId === this.root.data.id)) {
        //   this.findInTree(parent)
        // }

        // show the node in this subtree
        // find parent node
        // create link to parent node

        // -----------
        // let node = this.findInTree(parent.id)
        // if (node) {
        //   console.log('existing node: ', node)

        //   const x = node.x
        //   const y = node.y

        //   // partner style
        //   // NOTE: children of this partner will inherit this style
        //   const style = {
        //     fill: 'none',
        //     stroke: settings.color.getColor(i),
        //     opacity: settings.opacity,
        //     strokeWidth: settings.thickness,
        //     strokeLinejoin: 'round'
        //   }

        //   // start point of the partner node links on the Y axist
        //   const yOffset = this.root.y + (i * settings.partner.spacing.y) + this.radius

        //   // const link = parent.isNonPartner ? {} : {
        //   //   style,
        //   //   // for drawing the link from the root parent to this partner/parent
        //   //   d: `
        //   //     M ${this.root.x + this.radius}, ${yOffset}
        //   //     H ${x + this.partnerRadius}`
        //   // }

        //   return {
        //     // x,
        //     // y,
        //     children: parent.children
        //       .filter(partnerChild => {
        //         return (
        //           this.children &&
        //           this.children.some(rootChild => {
        //             if (!rootChild || !partnerChild) return false
        //             return (rootChild.data.id === partnerChild.id)
        //           })
        //         )
        //       }) // filter out children who arent this nodes
        //       .map(child => this.mapChild({ x, y, center: !parent.isNonPartner, yOffset }, child, style, parent)),
        //     data: parent,
        //     // link
        //   }
        // } else {


          // used to alternate between left and right
          const sign = i >= midway ? 1 : -1

          const offset = sign === 1
            ? this.diameter - 2 * this.partnerRadius // right
            : 0 // left

          const xMultiplier = sign === 1
            ? (i - midway) + 1
            : i - midway
          // how far sideways the partner sits from the root node at 0
          const x = this.root.x + offset + xMultiplier * (this.diameter + X_PADDING)
          // if we are negative theres no offset
          // if we are positive - use diameter

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

          const link = parent.isNonPartner ? {} : {
            style,
            // for drawing the link from the root parent to this partner/parent
            d: `
              M ${this.root.x + this.radius}, ${yOffset}
              H ${x + this.partnerRadius}`
          }

          return {
            x,
            y,
            children: parent.children
              .filter(partnerChild => {
                return (
                  this.children &&
                  this.children.some(rootChild => {
                    if (!rootChild || !partnerChild) return false
                    return (rootChild.data.id === partnerChild.id)
                  })
                )
              }) // filter out children who arent this nodes
              .map(child => this.mapChild({ x, y, center: !parent.isNonPartner, yOffset }, child, style, parent)),
            data: parent,
            link
          }
        // }
      })
    },
    focus ($event) {
      this.changeFocus($event)
    },
    center ($event) {
      this.centerNode($event)
    },
    mapChild ({ x = this.root.x, y = this.root.y, center, sign, yOffset = 0 }, child, style, parent, ghostParent) {

      // map to their node from the root parent
      const node = this.root.children.find(rootChild => child.id === rootChild.data.id)

      // change the link if they are not related by birth
      const dashed = parent && parent.relationshipType ? ['adopted', 'whangai'].includes(parent.relationshipType) : ['adopted', 'whangai'].includes(node.data.relationshipType)

      // center the link between the parents
      if (center) {
        x = x - this.radius + this.partnerRadius - sign * (this.partnerRadius + 20)// end constant is dependant on radius, partnerRadius, X_PADDING
        y = yOffset - this.radius
      }

      let offCenter = !ghostParent && !center

      if (offCenter) {
        x -= 5
      }

      return {
        ...node,
        link: {
          style: {
            ...style, // inherits the style from the parent so the links are the same color
            strokeDasharray: dashed ? 2.5 : 0 // for drawing a dashed link to represent adopted/whangai
          },
          d: settings.path( // for drawing a link from the parent to child
            {
              startX: x + this.radius,
              startY: y + this.radius,
              endX: node.x + this.radius,
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
