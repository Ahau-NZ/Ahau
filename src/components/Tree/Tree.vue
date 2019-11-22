<template>
  <div id="app">
    <v-container class="body-width white mx-auto py-12 px-12">
      <v-row>
        <h1>Tree</h1>
      </v-row>
      <v-row>
        <!--<v-btn @click="newNode().addChild(tempNode)"> Add Child </v-btn>-->
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
              <Node :node="node" :radius="settings.nodeRadius" @click="viewNode().show($event)" />
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

    <ViewNodeDialog v-if="dialogs.viewNode" :show="dialogs.viewNode" @close="viewNode().hide()" :node="node.selected" />
    <EditNodeDialog v-if="dialogs.editNode" :show="dialogs.editNode" @close="editNode().hide()" />
    <NewNodeDialog
      v-if="dialogs.newNode"
      :show="dialogs.newNode"
      @close="newNode().hide()"
      @submit="newNode().addChild($event)"
    />
  </div>
</template>

<script>
import * as d3 from 'd3'

import { VueContext } from 'vue-context'

import Node from './Node.vue'
import Link from './Link.vue'
import ViewNodeDialog from './Dialogs/ViewNodeDialog.vue'
import EditNodeDialog from './Dialogs/EditNodeDialog.vue'
import NewNodeDialog from './Dialogs/NewNodeDialog.vue'
import mockTreeData from './mock-tree-data'

console.log(mockTreeData)

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
      tempNode: {
        title: 'Ms',
        gender: 'Female',
        preferredName: 'Temp',
        legalName: 'Temporary Node',
        dateOfBirth: '1970-07-19',
        dateOfDeath: '',
        adopted: false,
        raised: false,
        children: []
      },
      dialogs: {
        viewNode: false,
        editNode: false,
        newNode: false
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
        {
          title: 'Edit Person',
          action: this.editNode().show
        },
        {
          title: 'Add Child',
          action: this.newNode().show
        },
        {
          title: 'Add Parent',
          action: this.addParent
        }
        // {
        //   title: 'Delete Person',
        //   action: this.deletePerson
        // },
        // {
        //   title: 'Add Sibling',
        //   action: this.addSibling
        // }
      ],
      options: {
        addnode: false
      },
      treeData: mockTreeData
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
      return d3.hierarchy(this.treeData)
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
  mounted () {
    // means the vue component has rendered
    this.componentLoaded = true
  },
  methods: {
    /*

    */
    openContextMenu ($event, node) {
      this.node.selected = node
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
    },
    /*
      handles hiding and showing the view person dialog
    */
    viewNode () {
      var vm = this
      return {
        show ($event) {
          vm.node.selected = $event
          vm.dialogs.viewNode = true
        },
        hide () {
          vm.dialogs.viewNode = false
        }
      }
    },
    /*
      handles hiding and showing the edit person dialog
    */
    editNode () {
      var vm = this
      return {
        show () {
          vm.dialogs.editNode = true
        },
        hide () {
          vm.dialogs.editNode = false
        }
      }
    },
    /*
      handles adding a node to the tree as well as hiding and showing the dialog
    */
    newNode () {
      var vm = this
      return {
        show () {
          vm.dialogs.newNode = true
        },
        hide () {
          vm.dialogs.newNode = false
        },
        /*
          adds a new child node onto the selected node
          TODO: Fix memory leak with NewNodeDialog and Tree
        */
        addChild ($event) {
          var newNodeObj = $event
          var selected = vm.node.selected
          var newNode = d3.hierarchy(newNodeObj)

          newNode.depth = selected.depth + 1
          newNode.height = selected.height - 1
          newNode.parent = selected

          if (selected.children === undefined) {
            selected.children = []
            selected.data.children = []
          }

          selected.children.push(newNode)
          selected.data.children.push(newNode.data)
        }
      }
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
