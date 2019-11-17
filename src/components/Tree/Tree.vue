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
            <g v-for="node in nodes" :key="node.id"
              class="node"
              @contextmenu.prevent="openMenu($event, node)"
              :style="node.style">
              <Node :node="node"/>
            </g>
          </g>
        </svg>
      </v-row>
    </v-container>
      <vue-context ref="menu">
        <li v-for="(option, index) in contextmenu" :key="index">
          <a hret="#" @click.prevent="option.action">{{ option.title }}</a>
        </li>
    </vue-context>
  </div>
</template>

<script>

import * as d3 from 'd3'
import Node from './Node.vue'
import Link from './Link.vue'

import { VueContext } from 'vue-context'

export default {
  components: {
    Node,
    Link,
    VueContext
  },
  data () {
    return {
      selectedNode: null,
      componentLoaded: false,
      settings: {
        nodeSeparationX: 150,
        nodeSeparationY: 150
      },
      contextmenu: [
        {
          title: 'Edit Person',
          action: this.editPerson
        },
        {
          title: 'Delete Person',
          action: this.deletePerson
        },
        {
          title: 'Add Child',
          action: this.addChild
        },
        {
          title: 'Add Sibling',
          action: this.addSibling
        },
        {
          title: 'Add Parent',
          action: this.addParent
        }
      ],
      treeData: {
        // my family data -> Claudine is the mother of 5 children, and one of them has a child 'Otene'
        name: 'Claudine',
        children: [
          {
            name: 'Zara',
            children: [
              {
                name: 'Otene',
                children: []
              }
            ]
          },
          {
            name: 'Cherese',
            children: []
          },
          {
            name: 'Daynah',
            children: []
          },
          {
            name: 'Pititi',
            children: []
          },
          {
            name: 'Damon',
            children: []
          }
        ]
      },
      familyTree: {
        id: 0,
        name: 'Stacey',
        partners: [
          {
            id: 1,
            name: 'Claudine',
            children: [
              {
                id: 2,
                name: 'Zara',
                partners: [
                  {
                    id: 7,
                    name: 'Makene',
                    children: [
                      {
                        'id': 8,
                        'name': 'Otene'
                      }
                    ]
                  }
                ]
              },
              {
                id: 3,
                name: 'Cherese',
                partners: [
                  {
                    id: 9,
                    name: 'Dillon'
                  }
                ]
              },
              {
                id: 4,
                name: 'Daynah'
              },
              {
                id: 5,
                name: 'Pititi',
                partners: [
                  {
                    id: 10,
                    name: 'Kevin'
                  }
                ]
              },
              {
                id: 6,
                name: 'Damon'
              }
            ]
          },
          {
            id: 11,
            name: 'Susan',
            children: [
              {
                id: 12,
                name: 'Zavien'
              }
            ]
          }
        ]
      }
    }
  },
  computed: {
    node() {
      return this.selectedNode
    },
    /*
      gets the X position of the tree based on the svg size
      @TODO: change so it does it when the screen is resized, only displays changes when the page is
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
      @TODO: change so it does it when the screen is resized, only displays changes when the page is
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
      console.log(this.root)
      return this.treeLayout(this.root)
        .descendants() // returns the array of descendants starting with the root node, then followed by each child in topological order
        .map((d, i) => { // returns a new custom object for each node
          return {
            id: `node-${i}`,
            index: i,
            name: d.data.name,
            children: d.data.children,
            style: {
              transform: this.nodeVertical(d.x, d.y) // sets the position of this node
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
        .links() // returns the array of links
        .map((d, i) => { // returns a new custom object for each link
          return {
            id: `link-${i}-${i + 1}`,
            index: i,
            // coordinates from drawing lines/links from Parent(x1,y1) to Child(x2,y2)
            x1: d.source.x, // centre x position of parent node
            x2: d.target.x, // centre x position of child node
            y1: d.source.y, // centre y position of the parent node
            y2: d.target.y // centre y position of the child node
          }
        })
    }
  },
  mounted () {
    // means the vue component has rendered
    this.componentLoaded = true
  },
  methods: {
    openMenu ($event, node) {
      this.selectedNode = node
      this.$refs.menu.open($event)
    },
    /*
      Method which calculates the transform to draw nodes horizontally
      @TODO: needs to be moved to the node component
    */
    nodeHorizontal (x, y) {
      return `translate(${y}px, ${x}px)`
    },
    /*
      Method which calculates the transform to draw nodes vertically
      @TODO: needs to be moved to the node component
    */
    nodeVertical (x, y) {
      return `translate(${x}px, ${y}px)`
    },
    /*
      handles editing a persons details
      @TODO: move into node component
    */
    editPerson () {
      console.log('editPerson')
    },
    /*
      handles deleting a person
      @TODO: figure out if more suited in node component or this component
    */
    deletePerson () {
      console.log('deletePerson')
    },
    /*
      handles adding a child to the person
      @TODO: move into node component
    */
    addChild () {
      console.log('addChild()')

      var newChild = {
        name: 'temp',
        children: []
      }

      if (this.node.children !== undefined){
        this.node.children.push(newChild)
      }else{
        this.node.children = [
          newChild
        ]
      }
    },
    /*
      handles adding a sibling to the node - adding child to parent of this node
      NOTE: will need to specify which parent?
      @TODO: figure out if more suited in node component or this component
    */
    addSibling () {
      console.log('addSibling')
    },
    /*
      handles adding a parent for the current node - adding this node as a child
      of a new parent node
      @TODO: figure out if more suited in node component or this component
    */
    addParent () {
      console.log('addParent')
    }
  }
}
</script>

<style scoped>
  @import '~vue-context/dist/css/vue-context.css';
  h1 {
    color: black;
  }
</style>
