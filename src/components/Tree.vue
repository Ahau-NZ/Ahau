<template>
  <div id="whakapapa-tree">
    <v-container class="white px-0 py-0 mx-auto">
      <!-- TODO extract this to WhakapapaShow, it's not part of the Tree -->
        <v-container class='header px-0 py-0'>
          <v-row>
            <v-col> <h1>{{ view.name }}</h1> </v-col>
          </v-row>
          <v-row>
            <v-col class='description'> {{ view.description }} </v-col>
          </v-row>
          <v-row class='lock-container'>
             <v-col class='lock-icon'>
              <v-icon small color='#555'>mdi-lock</v-icon>
               <span id='lock-icon-margin'>Private record - Only visible by you</span>
              </v-col>
          </v-row>
        </v-container>

      <v-row>
        <svg id="baseSvg" width="100%" :height="height" ref="baseSvg">
          <g id="baseGroup">
            <g :transform="`translate(${treeX} ${treeY})`">
              <g v-for="link in links" :key="link.id" class="link">
                <Link :link="link" :branch="branch" />
              </g>
            </g>

            <g :transform="`translate(${treeX - nodeRadius} ${treeY - nodeRadius})`"
              ref="tree">
              <g v-for="node in nodes" :key="node.data.id" class="node">
                <Node :node="node" :radius="nodeRadius"
                  @click="collapse(node)"
                  @open-context-menu="$emit('open-context-menu', $event)"
                  :showLabel="true"
                />
              </g>
            </g>
          </g>
        </svg>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import * as d3 from 'd3'
import get from 'lodash.get'
import Node from './tree/Node.vue'
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
    profiles: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      componentLoaded: false, // need to ensure component is loaded before using $refs
      // ?? think this is unused ??
      // node: {
      //   new: null
      // },

      nodeRadius: 50, // use variable for zoom later on
      nodeSeparationX: 100,
      nodeSeparationY: 150
    }
  },
  mounted () {
    this.componentLoaded = true
    this.zoom()
  },
  computed: {
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
      return d3.tree()
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
        .map((d, i) => { // returns a new custom object for each node
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
        }))
    }
  },
  components: {
    Node,
    Link
  }
}
</script>

<style scoped lang="scss">
  @import '~vue-context/dist/css/vue-context.css';

  #whakapapa-tree {
    .container {
      position: relative;

      .header {
        position: absolute;
        top: 20px;
        left: 30px;

        .col {
          padding-top: 0;
          padding-bottom: 0;
        }
      }
    }
  }
  h1 {
    color: black;
  }
  .description {
    color: #555;
  }
  .lock-container {
    margin-top: 20px;
    .lock-icon {
      display: flex;
      align-items: center;
      font-size: 0.8em;
      color: #555;
    }
    #lock-icon-margin {
     margin-left: 10px;
    }
  }
  svg#baseSvg {
    cursor: grab;
  }
</style>
