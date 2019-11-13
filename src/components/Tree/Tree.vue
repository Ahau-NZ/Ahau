<template>
  <div id="app">
    <v-container class="body-width white mx-auto py-12 px-12">
      <v-row>
          <h1>Tree</h1>
      </v-row>
      <v-row>
        <svg width="100%" :height="height-treeHeight" ref="baseSvg">
          <g :transform="`translate(${treeX} ${treeY})`" ref="tree">
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

export default {
  components: {
    Node,
    Link
  },
  data () {
    return {
      componentLoaded: false,
      settings: {
        nodeSeparationX: 100,
        nodeSeparationY: 100,
        radius: 40,
        branch: 50
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
      }
    }
  },
  computed: {
    /*
      gets the X position of the tree based on the svg size
      TODO: change so it does it when the screen is resized, only displays changes when the page is 
      refreshed
    */
    treeX () {
      if (!this.componentLoaded) {
        return null
      }
      return this.$refs.baseSvg.clientWidth / 2
    },
    /*
      gets the Y position of the tree based on the svg size
      TODO: change so it does it when the screen is resized, only displays changes when the page is 
      refreshed
    */
    treeY () {
      if (!this.componentLoaded) {
        return null
      }
      return this.$refs.baseSvg.clientHeight / 3
    },
    /*
      gets the width of the tree
    */
    treeWidth () {
      if (!this.componentLoaded) {
        return null
      }
      return this.$refs.tree.clientWidth
    },
    /*
      gets the height of the tree
    */
    treeHeight () {
      if (!this.componentLoaded) {
        return null
      }
      return this.$refs.tree.clientHeight
    },
    /*
      returns the width of the screen
    */
    width () {
      return screen.width
    },
    /*
      returns the height of the screen
    */
    height () {
      return screen.height
    },
    /*
      returns a nested data structure representing a tree based on the treeData object
    */
    root () {
      return d3.hierarchy(this.treeData)
    },
    /*
      creates a new tree layout and sets the size depending on the separation
      between nodes
    */
    treeLayout () {
      return d3.tree()
        .nodeSize([
          this.settings.nodeSeparationX,
          this.settings.nodeSeparationY
        ])
        .separation(function (a, b) {
          return a.parent === b.parent ? 1 : 2
        })
    },
    /*
      returns an array of nodes associated with the root node created from the treeData object, as well as
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
              transform: this.nodeVertical(d.x, d.y) //sets the position of this node
            },
            x: d.x, // X position for the centre of the node (USEFUL TO HAVE)
            y: d.y // Y position for the centre of the node (USEFUL TO HAVE)
          }
        })
    },
    /*
      returns an array of links which holds the X and Y coordinates of both the parent (source) and child (target) nodes
    */
    links () {
      return this.treeLayout(this.root)
        .links() //returns the array of links
        .map((d, i) => { //returns a new custom object for each link
          return {
            id: `link-${d.source.data.id}-${d.target.data.id}`,
            index: i,
            // coordinates from drawing lines/links from Parent(x1,y1) to Child(x2,y2)
            x1: d.source.x, // centre x position of parent node
            x2: d.target.x, // centre x position of child node
            y1: d.source.y, // centre y position of the parent node
            y2: d.target.y, // centre y position of the child node
          }
        })
    }
  },
  mounted () {
    //means the vue component has rendered
    this.componentLoaded = true
  },
  methods: {
    /*
      Method which calculates the transform to draw nodes horizontally
      TODO: needs to be moved to the node component
    */
    nodeHorizontal (x, y) {
      return `translate(${y}px, ${x}px)`
    },
    /*
      Method which calculates the transform to draw nodes vertically
      TODO: needs to be moved to the node component
    */
    nodeVertical (x, y) {
      return `translate(${x}px, ${y}px)`
    }
  }
}
</script>

<style scoped>
  h1 {
    color: black;
  }
</style>
