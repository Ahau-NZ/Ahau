<template>
  <svg id="baseSvg" :width="width" :height="tableHeight" ref="baseSvg" style="background-color:white" overflow="auto" min-height="500px">
    <!-- for (const {label, value, format, x} of columns) { -->    
    <line x1="60" y1="50" x2="90%" y2="50" style="stroke-width: 1; stroke: lightgrey;"/>
    <g v-for="column in columns" :key="column.label">
      <text :transform="`translate(${column.x + (nodeSize * 5)} ${30})`">
        {{ column.label }}
      </text>
      <line :x1="column.x + (nodeSize*5)" y1="50" :x2="column.x + (nodeSize*5)" y2="100%" style="stroke-width: 1; stroke: lightgrey;"/>
    </g>
      <g id="baseGroup">
        <g :transform="`translate(${100} ${100})`">
          <g v-for="link in links" :key="link.id" class="link">
            <Link :link="link" :branch="branch" :class="link.class"/>
          </g>
        </g>

        <g
          :transform="`translate(${100 - nodeRadius} ${100 - nodeRadius})`"
          ref="tree"
        >
          <g v-for="node in nodes" :key="node.data.id" class="node">
            <Node
              :node="node"
              :radius="nodeRadius"
              @click="collapse(node)"
              @open-context-menu="$emit('open-context-menu', $event)"
              :showLabel="true"
              />
              <text  :transform="`translate(${columnX.count + (nodeSize * 5)} ${node.y + nodeRadius})`">
                {{ node.children ? node.children.length : 0 }}
              </text>
              <text  :transform="`translate(${columnX.legalName + (nodeSize * 5)} ${node.y + nodeRadius})`">
                {{ node.data.legalName }}
              </text>
          </g>
        </g>
      </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import get from 'lodash.get'
import Node from './table/Node.vue'
import Link from './tree/Link.vue'

export default {
  props: {
    nestedWhakapapa: {
      type: Object,
      default: () => ({
        preferredName: 'Loading',
        gender: 'unknown',
        children: [],
        parents: []
      })
    },
    view: {
      type: Object,
      required: true
    },
    relationshipLinks: {
      type: Array
    }
  },
  data () {
    return {
      componentLoaded: false, // need to ensure component is loaded before using $refs
      // ?? think this is unused ??
      // node: {
      //   new: null
      // },
      nodeRadius: 25, // use variable for zoom later on
      nodeSize: 50,
      tableHeight: 0,
      // nodeSeparationX: 100,
      // nodeSeparationY: 150,
      columnX: {
        size: 280,
        count: 290,
        legalName: 350
      },
      columns: [
        {
          label: 'Size',
          value: d => d.value,
          format: this.format,
          x: 280
        },
        {
          label: 'Children',
          value: d => d.children && d._children ? 0 : 1,
          format: (value, d) => d.children ? this.format(value) : '-',
          x: 340
        },
        {
          label: 'Legal Name',
          value: d => d.data.legalName,
          format: (value, d) => d.data.legalName ? this.format(value) : '-',
          x: 410
        }
      ]
    }
  },
  mounted () {
    this.componentLoaded = true
    // this.zoom()
  },
  computed: {
    format () {
      return d3.format(',')
    },
    branch () {
      return this.nodeSeparationY / 2 + this.nodeRadius
      console.log(branch)
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
      var height = 0
     this.tableLayout
      return screen.height

    },
    /*
      creates a new tree layout and sets the size depending on the separation
      between nodes
    */
   tableLayout () {  
      var index = -1
      var layout = this.root.eachBefore(function(n) {
        n.y = ++index * 50
        n.x = n.depth * 20
      })
      this.tableHeight = (1 + index) * 100
      return layout
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
      return this.tableLayout
        .descendants() // returns the array of descendants starting with the root node, then followed by each child in topological order
        .map((d, i) => {
          // returns a new custom object for each node
          return {
            nodeId: `node-${i}`,
            children: d.children,
            data: d.data,
            depth: d.depth,
            height: d.height,
            parent: d.parent,
            x: d.x,
            y: d.y*1.5,
            // transform: `translate(0,${i * this.nodeSize})`
          }
        })

      // .attr("transform", d => `translate(0,${d.index * nodeSize})`);
    },
    /*
      returns an array of links which holds the X and Y coordinates of both the parent (source) and child (target) nodes
    */
    links () {
      return this.tableLayout
        .links() // returns the array of links
        .map((d, i) => { // returns a new custom object for each link
          return {
            id: `link-${i}-${i + 1}`,
            index: i,
            relationshipType: d.target.data.relationshipType ? d.target.data.relationshipType[0] : '',
            d: `M${d.source.x - this.nodeRadius/2},${d.source.y*1.5}
                V${d.target.y*1.5}
                h${d.target.x/(d.target.x*.1)}
            `,
            class: this.relationshipLinks[d.source.data.id + '-' + d.target.data.id].relationshipType !== 'birth' ? 'nonbiological' : ''
          }
        })
    },
  },
  methods: {
    loadDescendants (profileId) {
      this.$emit('load-descendants', profileId)
    },
    collapse (node) {
      this.$emit('collapse-node', node.data.id)
      // TODO
      // this one feels like perhaps it should be handled in this file
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
        d3.zoom().on('zoom', function () {
          g.attr('transform', d3.event.transform)
        })
      )
    }
  },
  components: {
    Node,
    Link
  }
}
</script>

<style scoped lang="scss">
svg#baseSvg {
  padding-top:100px;
  min-height: calc(100vh - 68px);
}

.nonbiological{
  stroke-dasharray: 2.5
}
</style>
