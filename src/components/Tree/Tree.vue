<template>
  <div id="app">
    <v-container class="body-width white mx-auto py-12 px-12"> 
      <v-row>
          <h1>Tree</h1>
      </v-row>
      <v-row>
        <svg width="100%" :height="svgHeight" ref="baseSvg">
          <g class="tree" :transform="`translate(${treeX} ${treeY})`">
            <g class="link" v-for="link in links" :key="link.id">
              <Link :link="link"/>
            </g>
            <g class="node" v-for="node in nodes" :key="node.id" :style="node.style">
              <Node :node="node"/>
            </g>
          </g>
        </svg>
      </v-row>
    </v-container>
  </div>
</template>

<script>

import * as d3 from 'd3'
import Node from './Node.vue'
import Link from './Link.vue'
import NodeMenu from './NodeMenu.vue'

export default {
  components: {
    Node,
    Link,
    NodeMenu
  },
  data () {
    return {
      componentLoaded: false,
      nodeSeparationX: 100,
      nodeSeparationY: 100,
      settings: {
        radius: 20,
        branch: 50
      },
      width: 900,
      height: 500,
      margin: {
        left: 120,
        top: 20, 
        right: 120,
        bottom: 20
      },
      treeData: {
        // my family data -> Claudine is the mother of 5 children, and one of them has a child 'Otene'
        id: 0,
        name: 'Claudine',
        children: [
          {
            id: 1,
            name: 'Zara',
            children: [
              {
                id: 6,
                name: 'Otene'
              }
            ]
          },
          {
            id: 2,
            name: 'Cherese'
          },
          {
            id: 3,
            name: 'Daynah'
          },
          {
            id: 4,
            name: 'Pititi'
          },
          {
            id: 5,
            name: 'Damon'
          }
        ]
      },
      items: [
        { title: 'Click Me' },
        { title: 'Click Me' },
        { title: 'Click Me' },
        { title: 'Click Me 2' }
      ]
    }
  },
  computed: {
    /*
      Returns computed width for the treeLayout()
      TODO: change this once I have more of an understanding
    */
    svgWidth () {
      return this.width
    },
    /*
      Returns computed height for the treeLayout()
      TODO: change this once I have more of an understanding
    */
    svgHeight () {
      return this.height
    },
    /*
      Returns a nested data structure representing a tree based on the treeData object
    */
    root () {
      return d3.hierarchy(this.treeData)
    },
    /*
      Creates a new tree layout and sets the size
    */
    treeLayout () {
      return d3.tree()
        //.size([960 - this.margin.right - this.margin.left, 500 - this.margin.top - this.margin.bottom])
        .nodeSize([
          this.nodeSeparationX,
          this.nodeSeparationY
        ])
        .separation(function(a, b) {
          return a.parent == b.parent ? 1 : 2;
        })
    },
    /*
      Returns an array of nodes associated with the root node created from the treeData object, as well as
      extra attributes

    */
    nodes () {
      return this.treeLayout(this.root)
        .descendants() // returns the array of descendants starting with the root node, then followed by each child in topological order
        .map((d, i) => { // returns a new custom object for each node
          return {
            id: `node-${d.data.id}`,
            index: i,
            name: d.data.name,
            children: d.data.children,
            style: {
              transform: this.nodeHorizontal(d.x, d.y)
            },
            radius: this.settings.radius, // could probably move to data(),
            x: d.x, // X position for the centre of the node (USEFUL TO HAVE)
            // y: d.y // Y position for the centre of the node (USEFUL TO HAVE)
            y: d.y
          }
        })
    },
    links () {
      return this.treeLayout(this.root)
        .links()
        .map((d, i) => {
          return {
            id: `link-${d.source.data.id}-${d.target.data.id}`,
            index: i,
            // coordinates from drawing lines/links from Parent(x1,y1) to Child(x2,y2)
            x1: d.source.x, // centre x position of parent node
            x2: d.target.x, // centre x position of child node
            y1: d.source.x, // centre y position of the parent node
            y2: d.target.y, // centre y position of the child node
            d: this.linkElbow(
              d.source.x,
              d.source.y,
              d.target.x,
              d.target.y
            )

          }
        })
    },
    treeX() {
      if(!this.componentLoaded){
        return null
      }
      return this.$refs.baseSvg.clientWidth/2
    },
    treeY() {
      if(!this.componentLoaded){
        return null
      }
      return this.$refs.baseSvg.clientHeight/3
    }
  },
  mounted () {
    this.componentLoaded = true;
  },
  methods: {
    /*
      Method which calculates the transform to draw nodes horizontally
      NOTE: links must be changed to use linkHorizontal()
    */
    nodeHorizontal (x, y) {
      return `translate(${x}px, ${y}px)`
    },
    /*
      Method which calculates the transform to draw nodes vertically
      NOTE: links must be changed to use linkVertical()
    */
    nodeVertical (x, y) {
      return `translate(${y}px, ${x}px)`
    },
    /*
      temp method for when a node is clicked
    */
    nodeClick (name) {
      alert(name)
    },
    /*
      Method which calculates the d attribute to draw links/lines horizontally
      NOTE: nodes must be changed to use nodeHorizontal()
    */
    linkHorizontal (sx, sy, tx, ty) {
      console.log(sx, sy, tx, ty)
      return `
        M ${sx}, ${sy}
        C ${sx}, ${sy + ty / 2}
        ${tx},${sy + ty / 2}
        ${tx}, ${ty}
        M ${sx}, ${sy}
      `
    },
    /*
      Method which calculates the d attribute to draw links/lines vertically
      NOTE: nodes must be changed to use nodeVertical()
    */
    linkVertical (sx, sy, tx, ty) {
      return `
        M ${sx},${sy}
        C ${(sx + tx) / 2},${sy}
        ${(sx + tx) / 2},${ty}
        ${tx},${ty}
      `
    },
    /*
      Method which calculates the d attribute to draw links/lines in an elbow style
    */
    linkElbow (sx, sy, tx, ty) {
      return `
        M ${sx}, ${sy} 
        v ${this.settings.branch} 
        H ${tx} 
        V ${ty}
      `
    }
  }
}
</script>

<style scoped>
  h1 {
    color: black;
  }
  .tree {
      
  }
</style>
