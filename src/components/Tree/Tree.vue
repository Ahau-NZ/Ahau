<template>
  <div id="app">
    <v-container class="body-width white mx-auto py-12 px-12">
      <v-row>
        <h1>Tree</h1>
      </v-row>
      <v-row>
        <!--<v-btn @click="addChild(mockNode)"> Add Child </v-btn>-->
        <svg width="100%" :height="height" ref="baseSvg">
          <g :transform="`translate(${treeX} ${treeY})`">
            <g v-for="link in links" :key="link.id" class="link">
              <Link :link="link" :branch="branch" />
            </g>
          </g>

          <g :transform="`translate(${treeX-settings.nodeRadius} ${treeY-settings.nodeRadius})`"
            ref="tree">
            <g v-for="node in nodes" :key="node.id"
              class="node"
              @contextmenu.prevent="openContextMenu($event, node)"
              :style="node.style">
              <Node :node="node" :radius="settings.nodeRadius" @click="toggleShow" />
            </g>
          </g>
        </svg>
      </v-row>
    </v-container>

    <vue-context ref="menu">
      <li v-for="(option, index) in contextmenu" :key="index">
        <a href="#" @click.prevent="option.action"> {{ option.title }} </a>
      </li>
    </vue-context>

    <ViewNodeDialog v-if="dialog.show" :show="dialog.show" :node="node.selected"
      @close="toggleShow"/>
    <EditNodeDialog v-if="dialog.edit" :show="dialog.edit"
      @close="toggleEdit"/>
    <NewNodeDialog v-if="dialog.new" :show="dialog.new"
      @close="toggleNew" @submit="addChild($event)"/>
  </div>
</template>

<script>
import * as d3 from 'd3'
import gql from 'graphql-tag'

import { VueContext } from 'vue-context'

import Node from './Node.vue'
import Link from './Link.vue'
import ViewNodeDialog from './Dialogs/ViewNodeDialog.vue'
import EditNodeDialog from './Dialogs/EditNodeDialog.vue'
import NewNodeDialog from './Dialogs/NewNodeDialog.vue'
// import mockTreeData from './mock-tree-data'
// import mockNode from './mock-node'

export default {
  components: {
    Node,
    Link,
    VueContext,
    ViewNodeDialog,
    EditNodeDialog,
    NewNodeDialog
  },
  data () {
    return {
      dialog: {
        show: false,
        edit: false,
        new: false
      },
      node: {
        selected: null,
        new: null
      },
      componentLoaded: false, // need to ensure component is loaded before using $refs
      settings: {
        nodeRadius: 45 // use variable for zoom later on
      },
      contextmenu: [
        { title: 'Add Child', action: this.toggleNew },
        { title: 'Add Parent', action: this.setNew },
        { title: 'Edit Person', action: this.toggleEdit }
      ],
      options: {
        addnode: false
      },
      whakapapa: {
          gender: null,
          preferredName: '',
          legalName: '',
          children: [],
          parents: []
      }
    }
  },
  computed: {
    branch () {
      return this.settings.nodeRadius + (this.settings.nodeRadius) / 2
    },
    /*
      the space between nodes on the x axis
      @TODO: will be used later on for implementing zoom and pan on tree
    */
    nodeSeparationX () {
      return this.settings.nodeRadius * 3
    },
    /*
      the space between node on the y axis
      @TODO: will be used later on for implementing zoom and pan on tree
    */
    nodeSeparationY () {
      return this.settings.nodeRadius * 3
    },
    /*
      gets the X position of the tree based on the svg size
      @TODO: change so it does it when the screen is resized, only displays changes when the page is
      refreshed
    */
    treeX () {
      if (!this.componentLoaded) {
        return 0
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
        return 0
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
      return d3.hierarchy(this.whakapapa)
    },
    /*
      creates a new tree layout and sets the size depending on the separation
      between nodes
    */
    treeLayout () {
      return d3.tree()
        .nodeSize([
          this.nodeSeparationX,
          this.nodeSeparationY
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
            children: d.children,
            data: d.data,
            depth: d.depth,
            height: d.height,
            parent: d.parent,
            x: d.x,
            y: d.depth * 180,
            style: {
              transform: this.nodeVertical(d.x, d.y) // sets the position of this node
            }
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
  apollo: {
    // Query with parameters
    whakapapa: {
      query: gql`query {
        whakapapa {
          id
          gender
          preferredName
          legalName
          children {
            id
            gender
            preferredName
            legalName
          }
          parents {
            id
            gender
            preferredName
            legalName
          }
        }
      }`,
      fetchPolicy: 'no-cache'
    }
  },
  mounted () {
    // means the vue component has rendered
    this.componentLoaded = true
  },
  methods: {
    toggleShow (target) {
      this.node.selected = target
      this.dialog.show = !this.dialog.show
    },
    toggleEdit () {
      this.dialog.edit = !this.dialog.edit
    },
    toggleNew (state = false) {
      this.dialog.new = !this.dialog.new
    },

    openContextMenu ($event, node) {
      this.node.selected = node
      this.$refs.menu.open($event)
    },
    /*
      adds a new child node onto the selected node
      TODO: Fix memory leak with NewNodeDialog and Tree
    */
    addChild ($event) {
      var selected = this.node.selected
      var newNode = d3.hierarchy($event)

      newNode.depth = selected.depth + 1
      newNode.height = selected.height - 1
      newNode.parent = selected

      if (selected.children === undefined) {
        selected.children = []
        selected.data.children = []
      }

      selected.children.push(newNode)
      selected.data.children.push(newNode.data)
    },

    // d3 helpers
    // @TODO: needs to be move these to the Node component
    nodeHorizontal (x, y) {
      // calculate the transform to draw nodes horizontally
      return `translate(${y}px, ${x}px)`
    },
    nodeVertical (x, y) {
      // calculate the transform to draw nodes vertically
      return `translate(${x}px, ${y}px)`
    }
  }
}
</script>

<style scoped lang="scss">
  @import '~vue-context/dist/css/vue-context.css';
  h1 {
    color: black;
  }
</style>
