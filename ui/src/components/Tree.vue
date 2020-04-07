<template>
  <!-- <div class="svgContainer"  style="border: 2px solid red;"> -->
    <svg id="baseSvg" width="100%" :height="height" ref="baseSvg">
      <!-- niho background picture -->
      <defs>
        <pattern id="img1" patternUnits="userSpaceOnUse" x="400" y="0" width="100%" height="100%">
          <image xlink:href="../assets/niho.svg" width="100%" height="100%" />
        </pattern>
      </defs>
      <path id="background" d="M5,5 l0,680 2980,0 l0,-680 l-980,0" fill="url(#img1)" />
      <!-- whakapapa tree -->
      <g id="baseGroup" >
        <g :transform="`translate(${treeX} ${treeY})`">
          <g v-for="link in links" :key="link.id" class="link">
            <Link :link="link" :class="link.class"/>
          </g>
        </g>

        <g
          :transform="`translate(${treeX - nodeRadius} ${treeY - nodeRadius})`"
          ref="tree"
        >
          <g v-for="node in nodes" :key="node.data.id" class="node">
            <Node
              :node="node"
              :radius="nodeRadius"
              :nonFocusedPartners="nonFocusedPartners"
              @click="centerNode(node)"
              @open-context-menu="$emit('open-context-menu', $event)"
              @change-focus="changeFocus($event, node)"
              :showLabel="true"
            />
          </g>
        </g>
      </g>
      <!-- zoom in, zoom out buttons -->
      <g class="zoomControl">
      <g @click="zoomReset()" :transform="`translate(${30} ${treeY*2.15})`">
          <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
          <circle stroke="black" fill="white" filter="url(#shadow)" cx="20" cy="1" r="5"/>
          <path d="M 20,-7 20,10 M 12,1 28,1" stroke="grey" stroke-width="1.5" />
        </g>
      <g @click="zoomInOut(1.6)" :transform="`translate(${30} ${treeY*2.4})`">
          <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
          <path d="M 20,-5 20,7 M 14,1 26,1" stroke="grey" stroke-width="1.5" />
        </g>
      <g @click="zoomInOut(1 / 1.6)" :transform="`translate(${30} ${treeY*2.65})`">
          <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
          <path d="M 14,1 26,1" stroke="grey" stroke-width="1.5" />
        </g>
      </g>
      <!-- loading spinner when changing focus -->
      <g v-if="loading">
        <rect width="100%" height="100%" style="fill:#fff; opacity:0.95" />
        <image :transform="`translate(${width/2 - 100} ${height/3})`" href="../assets/grid-loader.svg" width="30" height="30" />
      </g>
    </svg>
  <!-- </div> -->
</template>

<script>
import * as d3 from 'd3'
import get from 'lodash.get'
import Node from './tree/Node.vue'
import Link from './tree/Link.vue'

import isEqual from 'lodash.isequal'

export default {
  props: {
    nestedWhakapapa: {
      type: Object,
      default: () => ({
        preferredName: 'Loading',
        gender: 'unknown',
        children: [],
        parents: [],
        nonFocusedPartner: false
      })
    },
    currentFocus: {
      type: String
    },
    view: {
      type: Object,
      required: true
    },
    relationshipLinks: {
      type: Array
    },
    searchNodeId: {
      type: String
    },
    getRelatives: Function
  },
  watch: {
    'nestedWhakapapa': function (newNestedWhakapapa) {
      if (newNestedWhakapapa.preferredName !== 'Loading') {
        this.nonFocusedPartners = []
        this.checkNonFocusedPartner(this.nestedWhakapapa)
      }
    },
    searchNodeId (newVal) {
      if (newVal === '') return null
      this.root.descendants().find(d => {
        if (d.data.id === newVal) {
          this.centerNode(d)
        }
      })
    },
    // watch for change of focus
    currentFocus (newValue) {
      if (this.changeFocusId != null) {
        // if theres a change wait for the nodes to load than map through to find the change of focus
        setTimeout(() => {
          this.nodes.map((d) => {
            if (d.data.id === this.changeFocusId) {
              console.log('match found')
              this.centerNode(d)
            }
          })
        }, 500)

        // hide the grapgh until the tree has centered
        setTimeout(() => {
          this.loading = false
        }, 1000)
      }
    }
  },
  data () {
    return {
      componentLoaded: false, // need to ensure component is loaded before using $refs
      nodeCentered: [], // hold centered node id
      collapseNode: false, // if node is centered than we can show/collapse

      nodeRadius: 50, // use variable for zoom later on
      nodeSeparationX: 100,
      nodeSeparationY: 150,
      nonFocusedPartners: [],
      changeFocusId: null,
      loading: false
    }
  },
  mounted () {
    this.componentLoaded = true
    this.zoom()
  },
  computed: {
    pathNode () {
      if (this.searchNodeId === '') return null
      return this.root.descendants().find(d => {
        return d.data.id === this.searchNodeId
      })
    },
    branch () {
      return this.nodeSeparationY / 2 + this.nodeRadius
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
      return this.$refs.baseSvg.clientHeight / 3
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
          this.nodeSeparationX + this.nodeRadius,
          this.nodeSeparationY + this.nodeRadius
        ])
        .separation((a, b) => {
          if (a.parent !== b.parent) return 1.3
          // "how far cousins be spaced"  (I think)
          // nodes have only one one "node.parent" (but multiple node.data.parents)

          return 1 + 0.3 * (this.visiblePartners(a) + this.visiblePartners(b))
          // "how far are siblings spaced" (I think)
          // start with a baseline of 1, then add a proportion of the number of partners
          // as partners take up less space than central node, are placed evenly to either side
        })
    },
    //  returns a nested data structure representing a tree based on the treeData object
    root () {
      return d3.hierarchy(this.nestedWhakapapa)
    },
    /*
      returns an array of nodes associated with the root node created from the treeData object, as well as
      extra attributes
    */
    nodes () {
      return this.treeLayout(this.root)
        .descendants() // returns the array of descendants starting with the root node, then followed by each child in topological order
        .map((d, i) => {
          return {
            nodeId: `node-${i}`,
            children: d.children,
            data: d.data,
            depth: d.depth,
            height: d.height,
            parent: d.parent,
            x: d.x,
            y: d.y
          }
        })
    },
    /*
      returns an array of links which holds the X and Y coordinates of both the parent (source) and child (target) nodes
    */
    links () {
      return this.treeLayout(this.root)
        .links() // returns the array of links
        .map((d, i) => { // returns a new custom object for each link
          return {
            id: `tree-link-${i}-${i + 1}`,
            index: i,
            relationshipType: d.target.data.relationshipType ? d.target.data.relationshipType[0] : '',
            // coordinates from drawing lines/links from Parent(x1,y1) to Child(x2,y2)
            x1: d.source.x, // centre x position of parent node
            x2: d.target.x, // centre x position of child node
            y1: d.source.y, // centre y position of the parent node
            y2: d.target.y, // centre y position of the child node
            class: this.relationshipLinks[d.source.data.id + '-' + d.target.data.id].relationshipType !== 'birth' ? 'nonbiological' : '',
            style: {
              fill: 'none',
              stroke: this.pathStroke(d.source.data.id, d.target.data.id)
            },
            d: `
              M ${d.source.x}, ${d.source.y}
              v ${this.branch}
              H ${d.target.x}
              V ${d.target.y}
            `
          }
        })
        .sort((a, b) => {
          var A = a.style.stroke
          var B = b.style.stroke
          if (A > B) return -1
          if (A < B) return 1
          return 0
        })
    },
    paths () {
      if (!this.componentLoaded || !this.pathNode) return null
      return this.root.path(this.pathNode)
        .map(d => d.data.id)
    }
  },

  methods: {
    pathStroke (sourceId, targetId) {
      if (!this.paths) return 'lightgrey'

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
      return 'lightgrey'
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
      this.$emit('collapse-node', node.data.id)
      //  TODO smooth ease-in-out transitions of children using d3 transitions
    },
    changeFocus (profileId, node) {
      this.loading = true
      node.data.id = profileId
      this.changeFocusId = profileId
      this.$emit('change-focus', profileId)
    },
    visiblePartners (node) {
      return get(node, 'data.isCollapsed')
        ? 0
        : get(node, 'data.partners.length', 0)
    },
    zoom () {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      svg.call(
        d3.zoom()
          .scaleExtent([0.3, 2])
          .on('zoom', function () {
            g.attr('transform', d3.event.transform)
          })
      )
        .on('dblclick.zoom', null)
    },
    centerNode (source) {
      // if source node is already centered than collapse

      if (this.nodeCentered === source.data.id) {
        this.collapse(source)
      }

      this.nodeCentered = source.data.id

      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      var width = this.$refs.tree.clientWidth
      var height = this.$refs.tree.clientHeight

      var x = width / 2 - source.x
      var y = height / 2 - source.y

      g.transition()
        .duration(1000)
        .attr('transform', 'translate(' + (x) + ',' + (y) + ')scale(' + 1 + ')')
        .on('end', function () { svg.call(d3.zoom().transform, d3.zoomIdentity.translate((x), (y)).scale(1)) })
    },
    zoomInOut (scale) {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      var zoom = d3.zoom()
        .scaleExtent([0.3, 2])
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
  },
  components: {
    Node,
    Link
  }
}
</script>

<style scoped lang="scss">
#background {
  opacity: 0.1
}

svg#baseSvg {
  cursor: grab;
  background: white;
}

.zoomControl {
  cursor: pointer;
}

.nonbiological{
  stroke-dasharray: 2.5
}

.svgContainer {

}
</style>
