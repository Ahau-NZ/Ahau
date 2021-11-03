<template>
  <svg id="baseSvg" width="100%" :height="height" ref="baseSvg">
    <g id="baseGroup">
      <g
        :transform="`translate(${treeX - radius} ${treeY - radius})`"
        ref="tree"
      >
        <SubTree
          :root="treeLayout(this.root)"
          :openMenu="openMenu"
          :changeFocus="changeFocus"
          :centerNode="centerNode"
          :nodeCentered="nodeCentered"
          :showAvatars="showAvatars"
          :showPartners="showPartners"
          :importantRelationships="view.importantRelationships"
        />

        <Link v-for="rule in view.importantRelationships"
          :link="{ }"
        />
      </g>
    </g>
    <!-- zoom in, zoom out buttons -->
    <g class="zoomControl">
      <g>
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="grey" flood-opacity="0.5"/>
          </filter>
        </defs>
      </g>
      <g @click="zoomReset()" :transform="mobile ? `translate(${15} ${treeY*3})` : `translate(${30} ${treeY*3.1})`">
        <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
        <circle stroke="black" fill="white" filter="url(#shadow)" cx="20" cy="1" r="5"/>
        <path d="M 20,-7 20,10 M 12,1 28,1" stroke="grey" stroke-width="1.5" />
      </g>
      <g @click="zoomInOut(1.6)" :transform="mobile ? `translate(${15} ${treeY*3.35})` : `translate(${30} ${treeY*3.4})`">
        <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
        <path d="M 20,-5 20,7 M 14,1 26,1" stroke="grey" stroke-width="1.5" />
      </g>
      <g @click="zoomInOut(1 / 1.6)" :transform="mobile ? `translate(${15} ${treeY*3.7})` : `translate(${30} ${treeY*3.7})`">
        <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
        <path d="M 14,1 26,1" stroke="grey" stroke-width="1.5" />
      </g>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import SubTree from './SubTree'

import isEqual from 'lodash.isequal'

import settings from '@/lib/link.js'

import { mapActions, createNamespacedHelpers } from 'vuex'
const { mapGetters: mapWhakapapaGetters } = createNamespacedHelpers('whakapapa')

export default {
  props: {
    openMenu: Function,
    view: {
      type: Object,
      required: true
    },
    searchNodeId: {
      type: String
    },
    getRelatives: Function,
    showAvatars: Boolean,
    showPartners: Boolean
  },
  components: {
    SubTree
  },
  data () {
    return {
      componentLoaded: false, // need to ensure component is loaded before using $refs
      nodeCentered: '', // hold centered node id

      nonFocusedPartners: [],
      changeFocusId: null,
      nodeId: '',
      lastNode: null
    }
  },
  mounted () {
    this.componentLoaded = true
    // set loader until all the nodes have been loaded
    this.zoom()
    this.scale()
  },

  computed: {
    ...mapWhakapapaGetters(['nestedWhakapapa']),
    radius () {
      return settings.radius
    },
    nodeSeparationX () {
      return this.radius * 3
    },
    nodeSeparationY () {
      return this.radius * 4
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    pathNode () {
      if (this.searchNodeId === '') return null
      return this.root.descendants().find(d => {
        return d.data.id === this.searchNodeId
      })
    },
    branch () {
      return this.nodeSeparationY / 2 + this.radius
    },
    /*
      gets the X position of the tree based on the svg size
      @TODO: change so it does it when the screen is resized, only displays changes when the page is
      refreshed
    */
    treeX () {
      if (!this.componentLoaded) return 0
      return this.$refs.baseSvg.clientWidth / 2
    },
    /*
      gets the Y position of the tree based on the svg size
      @TODO: change so it does it when the screen is resized, only displays changes when the page is
      refreshed
    */
    treeY () {
      if (!this.componentLoaded) return 0
      return this.$refs.baseSvg.clientHeight / 4
    },
    treeWidth () {
      if (!this.componentLoaded) return null
      return this.$refs.tree.clientWidth
    },
    treeHeight () {
      if (!this.componentLoaded) return null
      return this.$refs.tree.clientHeight
    },
    width () {
      return screen.width
    },
    height () {
      return screen.height
    },
    /*
      creates a new tree layout and sets the size depending on the separation
      between nodes
    */
    treeLayout () {
      return d3
        .tree()
        .nodeSize([
          this.nodeSeparationX,
          this.nodeSeparationY
        ])
        .separation((a, b) => {
          const separation = (a.parent === b.parent)
            ? this.distanceBetweenNodes(b, a) // siblings (left=B, right=A)
            : this.distanceBetweenNodes(a, b, true) // cousins (left=A, right=B)

          return separation
        })
    },

    //  returns a nested data structure representing a tree based on the treeData object
    root () {
      return d3.hierarchy(this.nestedWhakapapa)
    },

    // returns an array of nodes associated with the root node created from the treeData object
    nodes () {
      return this.treeLayout(this.root)
        .descendants()
        // returns the array of descendants starting with the root node, then followed by each child in topological order
    },
    paths () {
      if (!this.componentLoaded || !this.pathNode) return null
      return this.root.path(this.pathNode)
        .map(d => d.data.id)
    },
    lessImportantLinks () {
      return this.view.importantRelationships.map(rule => {
        // TODO HERE

        look up the rule.profileId node, rule.important.slice(1) nodes

        return {
          // style
          d: settings.path(
            {
              startX: 
              startY:
              endX: 
              endY:
            },
            settings.branch
          )
        }
      })
      // TODO flaten later if we have multiple less important per node
    }
  },
  watch: {
    'nestedWhakapapa': function (newValue) {
      // Check for partners parents dots
      if (newValue.preferredName !== 'Loading') {
        this.nonFocusedPartners = []
        this.checkNonFocusedPartner(this.nestedWhakapapa)
      }
      if (this.changeFocusId !== null) {
        this.nodes.find(d => {
          if (d.data.id === this.changeFocusId) {
            this.centerNode(d)
            this.changeFocusId = null
          }
        })
      }
    },
    searchNodeId (newVal) {
      if (newVal === '') return null
      this.root.descendants().find(d => {
        if (d.data.id === newVal) {
          this.centerNode(d)
        }
      })
    }
  },

  methods: {
    ...mapActions(['setLoading']),
    distanceBetweenNodes (leftNode, rightNode, cousins) {
      const leftNodesRightPartners = settings.separation.visiblePartners(leftNode)
      const rightNodesLeftPartners = settings.separation.visiblePartners(rightNode)

      var combinedPartners = leftNodesRightPartners + rightNodesLeftPartners

      if (cousins) {
        // depends on the parents partners
        const leftNodesParentPartners = settings.separation.visiblePartners(leftNode.parent)
        const rightNodesParentPartners = settings.separation.visiblePartners(rightNode.parent)
        combinedPartners += 0.5 * (leftNodesParentPartners + rightNodesParentPartners)
      }

      return 1 + (0.5 * combinedPartners)
    },
    pathStroke (sourceId, targetId) {
      if (!this.paths) return 'darkgrey'

      var currentPath = [
        sourceId,
        targetId
      ]

      var pairs = d3.pairs(this.paths)
        .filter(d => {
          return isEqual(d, currentPath)
        })

      if (pairs.length > 0) {
        return '#b02425'
      }
      return 'darkgrey'
    },

    loadDescendants (profileId) {
      this.$emit('load-descendants', profileId)
    },

    async checkNonFocusedPartner (profile) {
      if (profile.partners && profile.partners.length > 0) {
        for await (const partner of profile.partners) {
          const relatives = await this.getRelatives(partner.id)
          if (relatives.parents && relatives.parents.length > 0) {
            this.nonFocusedPartners = [...this.nonFocusedPartners, partner.id]
          }
        }
      }
      if (profile.children) {
        for await (const child of profile.children) {
          await this.checkNonFocusedPartner(child)
        }
      }
    },

    collapse (node) {
      const profile = node.data
      const { children, _children = [] } = profile

      if (children.length === 0 && _children.length === 0) return

      Object.assign(profile, {
        isCollapsed: !profile.isCollapsed,
        _children: children,
        children: _children
      })

      // find the node position now
      var _node = this.root.descendants().find(d => {
        return d.data.id === node.data.id
      })

      // setTimeout needed to get new node position after it has finished collapsing/expanding
      setTimeout(() => {
        var svg = d3.select('#baseSvg')
        var g = d3.select('#baseGroup')

        var width = this.$refs.tree.clientWidth
        var height = this.$refs.tree.clientHeight

        var x = width / 2 - _node.x
        var y = height / 2 - _node.y + 150

        g.transition()
          .duration(700)
          .attr('transform', `translate(${x}, ${y})`)
          .on('end', function () { svg.call(d3.zoom().transform, d3.zoomIdentity.translate((x), (y))) })
      }, 100)
    },

    changeFocus (profileId) {
      this.changeFocusId = profileId
      this.$emit('change-focus', profileId)
    },
    zoom () {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      svg.call(
        d3.zoom()
          .scaleExtent([0.05, 2])
          .on('zoom', function () {
            g.attr('transform', d3.event.transform)
          })
      )
        .on('dblclick.zoom', null)
    },
    scale () {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')
      var zoom = d3.zoom()
        .on('zoom', function () {
          g.attr('transform', d3.event.transform)
        })
      zoom.scaleBy(svg.transition().duration(0), 0.8)
    },

    centerNode (source) {
      // if source node is already centered than collapse

      if (this.nodeCentered === source.data.id) {
        this.collapse(source)
        return
      }

      this.nodeCentered = source.data.id

      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      var width = this.$refs.tree.clientWidth
      var height = this.$refs.tree.clientHeight

      var x = width / 2 - source.x
      var y = height / 2 - source.y + 150

      g.transition()
        .duration(700)
        .attr('transform', 'translate(' + (x) + ',' + (y) + ')')
        .on('end', function () { svg.call(d3.zoom().transform, d3.zoomIdentity.translate((x), (y))) })
    },
    zoomInOut (scale) {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      var zoom = d3.zoom()
        .scaleExtent([0.05, 2])
        .on('zoom', function () {
          g.attr('transform', d3.event.transform)
        })

      zoom.scaleBy(svg.transition().duration(150), scale)
    },
    zoomReset () {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      var width = this.$refs.tree.clientWidth
      var height = this.$refs.tree.clientHeight
      g.transition()
        .duration(400)
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')scale(' + 1 + ')')
        .on('end', function () {
          svg.call(
            d3.zoom().transform,
            d3.zoomIdentity.translate((width / 2), (height / 2))
              .scale(1)
          )
        })
    }
  }
}
</script>

<style scoped lang="scss">
#background {
  opacity: 0.1;
}

svg#baseSvg {
  cursor: grab;
  background: linear-gradient(rgba(255, 255, 255, 0.99), rgba(255, 255, 255, 0.88)), url(../../assets/niho.svg);
  background-repeat: no-repeat;
  background-size: cover;
}

.zoomControl {
  cursor: pointer;
}

</style>
