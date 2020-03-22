<template>
  <svg id="baseSvg" :width="2000" :height="tableHeight" ref="baseSvg" style="background-color:white" overflow="auto" min-height="500px">
    <line x1="60" y1="50" x2="90%" y2="50" style="stroke-width: 1; stroke: lightgrey;"/>
    <g v-for="column in columns" :key="column.label">
      <text :transform="`translate(${column.x + 10} ${40})`">
        {{ column.label }}
      </text>
      <line :x1="column.x" y1="50" :x2="column.x" y2="100%" style="stroke-width: 1; stroke: lightgrey;"/>
    </g>
      <g id="baseGroup">
        <g v-if="!flatten" :transform="`translate(${60} ${80})`">
          <g  v-for="link in links" :key="link.id" class="link">
            <Link :link="link" :class="link.class"/>
          </g>
        </g>

        <g
          :transform="`translate(${60 - nodeRadius} ${80 - nodeRadius})`"
          ref="tree"
        >
          <g v-for="node in nodes" :key="node.data.id" class="node">
            <!-- <line x1="0" :y1="node.y-3" x2="90%" :y2="node.y-3" style="stroke-width: 1; stroke: lightgrey;"/> -->
            <rect :x="node.x + nodeRadius" :y="node.y" width="100%" :height="nodeRadius*2" class="row" :style="node.color" />
            <Node
              :width="width"
              :node="node"
              :radius="nodeRadius"
              @click="collapse(node)"
              @open-context-menu="$emit('open-context-menu', $event)"
              :showLabel="true"
              />
              <g v-if="flatten && node.data.isCollapsed" :transform="`translate(${node.x - 10} ${node.y + nodeRadius + 5})`">
                <text> + </text>
              </g>
              <g v-if="flatten && node.data.children.length > 0" :transform="`translate(${node.x - 10} ${node.y + nodeRadius + 5})`">
                <text> - </text>
              </g>
              <svg :width="columns[1].x - 45" >  
                <text  :transform="`translate(${columns[0].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                  {{ node.data.legalName }}
                </text>
              </svg>
              <svg :width="columns[2].x - 45">  
                <text  :transform="`translate(${columns[1].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                  {{ node.age }}
                </text>
              </svg>
              <svg :width="columns[3].x - 45">  
                <text  :transform="`translate(${columns[2].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                  {{ node.profession }}
                </text>
              </svg>
              <svg :width="columns[4].x">  
                <text  :transform="`translate(${columns[3].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                  {{ node.location }}
                </text>
              </svg>
              <svg >  
                <text  :transform="`translate(${columns[4].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                  {{ node.contact }}
                </text>
              </svg>
              
          </g>
        </g>
      </g>
  </svg>
</template>

<script>
import * as d3 from 'd3'
import get from 'lodash.get'
import Node from './table/Node.vue'
import Link from './table/Link.vue'
import FlattenButton from '@/components/button/FlattenButton.vue'

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
    },
    flatten: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // width used for to set max widths on columns and the text
      width:350,
      componentLoaded: false, // need to ensure component is loaded before using $refs
      nodeRadius: 20, // use variable for zoom later on
      nodeSize: 40,
      tableHeight: 0,
      duration: 400,
      
    }
  },
  mounted () {
    this.componentLoaded = true
  },
  computed: {

    colWidth(){
      if (this.flatten){
        this.width = 300
      }
    },

    columns () {
      return [
        {
          label: 'Legal Name',
          x: this.width
        },
        {
          label: 'Age',
          x: this.width + 175
        },
        {
          label: 'Profession',
          x: this.width + 220
        },
        {
          label: 'Location',
          x: this.width + 375
        },
        {
          label: 'Contact',
          x: this.width + 600
        }
      ]
    },

    // colData () {
    //   return this.columns.map()
    // },

    //  returns a nested data structure representing a tree based on the treeData object
    root () {
      return d3.hierarchy(this.nestedWhakapapa)
    },

    // creates a new table layout and sets the size depending on number of nodes
    tableLayout () {
      var flatten = this.flatten
      var index = -1
      var layout = this.root.eachBefore(function (n) {
        n.y = ++index * 30
        n.x = flatten ? 0.1 : n.depth * 15
      })
      this.tableHeight = (1 + index) * 60
      return layout
    },

    // returns an array of nodes associated with the root node created from the treeData object, as well as extra attributes
    nodes () {
      var index = -1
      // turns bornAt to age
      function getAge (bornAt) {
        if (bornAt === null) return
        var date = new Date(bornAt)
        var diff_ms = Date.now() - date.getTime()
        var age_dt = new Date(diff_ms)
        return Math.abs(age_dt.getUTCFullYear() - 1970)
      }

      // changes row colour
      function nodeColor (data) {
        var age = getAge(data.bornAt)
        if (data.isCollapsed) {
          return 'fill:cadetblue'
        } else if (age < 1) {
          return 'fill:yellow'
        } else return 'fill:lightblue'
      }

      return this.tableLayout
        // returns the array of descendants starting with the root node, then followed by each child in topological order
        .descendants()
        // filter deceased
        .filter(peeps => {
          if (this.filter && peeps.data.diedAt !== null) {
            return false
          }
          return true
        })
        // returns a new custom object for each node
        .map((d, i) => {
          return {
            nodeId: `node-${i}`,
            children: d.children,
            data: d.data,
            depth: d.depth,
            height: d.height,
            parent: d.parent,
            x: d.x,
            y: this.filter ? ++index * 45 : d.y * 1.5,
            age: getAge(d.data.bornAt),
            color: nodeColor(d.data),
            profession: d.data.profession,
            location: d.data.location,
            contact: d.data.contact

          }
        })
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
            d: `M${d.source.x - this.nodeRadius / 2},${d.source.y * 1.5}
                V${d.target.y * 1.5}
                h${d.target.x / (d.target.x * 0.1)}
            `,
            class: this.relationshipLinks[d.source.data.id + '-' + d.target.data.id].relationshipType !== 'birth' ? 'nonbiological' : ''
          }
        })
    }
  },

  watch:{
    flatten(newVal){
      if(newVal){
        this.width = 250
      }
      else this.width = 350
    }
  },

  methods: {
    collapse (node) {
      this.$emit('collapse-node', node.data.id)
      // TODO
      // this one feels like perhaps it should be handled in this file
    }
  },
  components: {
    Node,
    Link,
    FlattenButton
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

.row {
  opacity: .2;
  fill: lightblue
}

text {
    fill: #555;
  }
</style>
