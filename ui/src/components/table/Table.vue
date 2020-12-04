<template>
  <svg id="baseSvg" :width="tableWidth" :height="tableHeight" ref="baseSvg" style="background-color:white"  min-height="500px">
    <g id="zoomable">
      <line x1="60" y1="55" :x2="tableWidth" y2="55" style="stroke-width: 1; stroke: lightgrey;"/>
      <g class="headers" v-for="column in columns" :key="column.label">
        <text :transform="`translate(${column.x + 10} ${50})`" @click="toggleSort(column.label)">
          {{ column.label }}
        </text>
        <line :x1="column.x" y1="55" :x2="column.x" :y2="tableHeight" style="stroke-width: 1; stroke: lightgrey;"/>
      </g>
      <svg id="baseGroup" :width="tableWidth">
        <g v-if="!flatten" :transform="`translate(${60} ${80})`">
          <g v-for="link in links" :key="link.id" class="link">
            <Link :link="link" :class="link.class"/>
          </g>
        </g>
        <g
          :transform="`translate(${60 - nodeRadius} ${80 - nodeRadius})`"
          ref="tree"
        >
          <g v-for="node in nodes" :key="node.data.id" class="node">
            <rect :x="node.x + nodeRadius" :y="node.y" :width="tableWidth" :height="nodeRadius*2" class="row" :style="node.color" />
            <Node
              :width="colWidth"
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
                {{ node.data.profession }}
              </text>
            </svg>
            <svg :width="columns[4].x - 45">
              <text  :transform="`translate(${columns[3].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.address }}
              </text>
            </svg>
            <svg :width="columns[5].x - 45">
              <text  :transform="`translate(${columns[4].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.location }}
              </text>
            </svg>
            <svg :width="columns[6].x - 45">
              <text :transform="`translate(${columns[5].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.email }}
              </text>
            </svg>
            <svg>
              <text :transform="`translate(${columns[6].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.phone }}
              </text>
            </svg>
          </g>
        </g>
      </svg>
    </g>
  </svg>
</template>

<script>

import * as d3 from 'd3'
import Node from './Node.vue'
import Link from '../tree/Link.vue'
import calculateAge from '../../lib/calculate-age.js'
import isEqual from 'lodash.isequal'
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    // nestedWhakapapa: {
    //   type: Object,
    //   default: () => ({
    //     preferredName: 'Loading',
    //     gender: 'unknown',
    //     children: [],
    //     parents: []
    //   })
    // },
    view: {
      type: Object,
      required: true
    },
    relationshipLinks: {
      type: Map
    },
    flatten: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Boolean,
      default: false
    },
    searchNodeId: {
      type: String
    },
    pan: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      tableWidth: 0,
      colWidth: 350,
      componentLoaded: false, // need to ensure component is loaded before using $refs
      nodeRadius: 20, // use variable for zoom later on
      nodeSize: 40,
      duration: 400,

      // The following variables are for sorting fields
      // 0 = no sort, 1 = sort ascending, 2 = sort descending
      sortLegalName: 0,
      sortAge: 0,
      sortProfession: 0,
      sortLocation: 0
    }
  },
  mounted () {
    this.componentLoaded = true
    this.tableOverflow()
  },

  computed: {
    ...mapGetters(['nestedWhakapapa']),

    pathNode () {
      if (this.searchNodeId === '') return null
      return this.root.descendants().find(d => {
        return d.data.id === this.searchNodeId
      })
    },

    // returns a nested data structure representing a tree based on the treeData object
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
      return layout
    },
    // table height based on number of nodes on table
    tableHeight () {
      if (!this.componentLoaded) return 0
      return (this.nodes.length + 1) * 52 + 100
    },

    // returns an array of nodes associated with the root node created from the treeData object, as well as extra attributes
    nodes () {
      return this.tableLayout
        // returns the array of descendants starting with the root node, then followed by each child in topological order
        .descendants()
        // sort by preferred name
        .sort((a, b) => {
          if (this.sortLegalName !== 0) {
            const aName = a.data.preferredName.toLowerCase() + a.data.legalName.toLowerCase()
            const bName = b.data.preferredName.toLowerCase() + b.data.legalName.toLowerCase()
            if (this.sortLegalName === 1) {
              if (aName < bName) { return -1 }
              if (aName > bName) { return 1 }
              return 0
            }
            if (this.sortLegalName === 2) {
              if (aName > bName) { return -1 }
              if (aName < bName) { return 1 }
              return 0
            }
          }
        })
        // sort by age
        .sort((a, b) => {
          if (this.sortAge !== 0) {
            const aAge = calculateAge(a.data.aliveInterval)
            const bAge = calculateAge(b.data.aliveInterval)
            if (this.sortAge === 1) {
              if (aAge < bAge) { return -1 }
              if (aAge > bAge) { return 1 }
              return 0
            }
            if (this.sortAge === 2) {
              if (aAge > bAge) { return -1 }
              if (aAge < bAge) { return 1 }
              return 0
            }
          }
        })
        // sort by profession
        .sort((a, b) => {
          if (this.sortProfession !== 0) {
            const aProfession = a.data.profession.toLowerCase()
            const bProfession = b.data.profession.toLowerCase()
            if (this.sortProfession === 1) {
              if (aProfession < bProfession) { return -1 }
              if (aProfession > bProfession) { return 1 }
              return 0
            }
            if (this.sortProfession === 2) {
              if (aProfession > bProfession) { return -1 }
              if (aProfession < bProfession) { return 1 }
              return 0
            }
          }
        })
        // sort by location
        .sort((a, b) => {
          if (this.sortLocation !== 0) {
            const aLocation = a.data.location.toLowerCase()
            const bLocation = b.data.location.toLowerCase()
            if (this.sortLocation === 1) {
              if (aLocation < bLocation) { return -1 }
              if (aLocation > bLocation) { return 1 }
              return 0
            }
            if (this.sortLocation === 2) {
              if (aLocation > bLocation) { return -1 }
              if (aLocation < bLocation) { return 1 }
              return 0
            }
          }
        })
        // filter deceased
        .filter(peeps => {
          if (this.filter && peeps.data.deceased) {
            return false
          }
          return true
        })
        // returns a new custom object for each node
        .map((d, i) => {
          // set width of first column
          this.setWidth(d.depth)
          return {
            nodeId: `table-node-${i}-${d.data.id}`,
            children: d.children,
            data: d.data,
            depth: d.depth,
            height: d.height,
            parent: d.parent,
            x: d.x,
            y: this.flatten ? i * 45 : d.y * 1.5,
            age: calculateAge(d.data.aliveInterval),
            color: this.nodeColor(d.data)
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
            id: `table-link-${i}-${d.target.data.id}`,
            index: i,
            relationshipType: d.target.data.relationship.relationshipType ? d.target.data.relationship.relationshipType : '',
            class: d.target.data.relationship.relationshipType !== 'birth' ? 'nonbiological' : '',
            style: {
              fill: 'none',
              stroke: this.pathStroke(d.source.data.id, d.target.data.id)
            },
            d: `
              M${d.source.x - this.nodeRadius / 2},${d.source.y * 1.5}
              V${d.target.y * 1.5}
              h${d.target.x / (d.target.x * 0.1)}
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
    },

    // the headers for the columns - width currently hardcoded
    columns () {
      return [
        {
          label: 'Legal Name',
          x: this.colWidth
        },
        {
          label: 'Age',
          x: this.colWidth + 200
        },
        {
          label: 'Profession',
          x: this.colWidth + 265
        },
        {
          label: 'Address',
          x: this.colWidth + 465
        },
        {
          label: 'City, Country',
          x: this.colWidth + 665
        },
        {
          label: 'Email',
          x: this.colWidth + 865
        },
        {
          label: 'Phone',
          x: this.colWidth + 1165
        }
      ]
    }
  },

  watch: {
    flatten (newValue) {
      if (newValue === true) this.colWidth = 250
      else this.colWidth = 350
    },

    nodes (newValue) {
      this.setLoading(false)
    }
  },
  methods: {
    ...mapActions(['updateNode', 'setLoading']),
    // sets the width of the table
    async tableOverflow () {
      var width = await this.colWidth + this.columns[this.columns.length - 1].x
      this.tableWidth = width
      this.$emit('update', this.tableWidth)
    },
    // function to control left and right scroll buttons in table
    panAction (x) {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#zoomable')

      var zoom = d3.zoom()
        .translateExtent([[0, 0], [2400, Infinity]])
        .on('zoom', function () {
          g.attr('transform', d3.event.transform)
        })

      zoom.translateBy(svg.transition().duration(100), (x), 0)
    },

    // set the width for the first column which needs to be dynamic when showing whakapapa links
    setWidth (depth) {
      if (!this.flatten && depth > 10) {
        this.colWidth = depth * 45 - 100
      }
    },

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

    // changes row colour
    nodeColor (data) {
      var age = calculateAge(data.aliveInterval)
      if (data.isCollapsed) {
        return 'fill:cadetblue'
      } else if (age !== null && age < 2) {
        return 'fill:yellow'
      } else if (data.id === this.searchNodeId) {
        return 'fill:red'
      } else return 'fill:lightblue'
    },

    async collapse (node) {
      const profile = node.data
      const { children, _children = [] } = profile

      if (children.length === 0 && _children.length === 0) return

      Object.assign(profile, {
        isCollapsed: !profile.isCollapsed,
        _children: children,
        children: _children
      })

      // this.updateNode({ is, path: endNode.path })
    },

    toggleSort (value) {
      // sort by name
      if (value === 'Legal Name') {
        this.sortAge = 0
        this.sortLocation = 0
        this.sortProfession = 0
        switch (this.sortLegalName) {
          case 0:
            this.sortLegalName = 1
            break
          case 1:
            this.sortLegalName = 2
            break
          case 2:
            this.sortLegalName = 0
            break
          default:
            this.sortLegalName = 0
        }
      }
      // sort by age
      if (value === 'Age') {
        this.sortLegalName = 0
        this.sortLocation = 0
        this.sortProfession = 0
        switch (this.sortAge) {
          case 0:
            this.sortAge = 1
            break
          case 1:
            this.sortAge = 2
            break
          case 2:
            this.sortAge = 0
            break
          default:
            this.sortAge = 0
        }
      }
      // sort by profession
      if (value === 'Profession') {
        this.sortLegalName = 0
        this.sortAge = 0
        this.sortLocation = 0
        switch (this.sortProfession) {
          case 0:
            this.sortProfession = 1
            break
          case 1:
            this.sortProfession = 2
            break
          case 2:
            this.sortProfession = 0
            break
          default:
            this.sortProfession = 0
        }
      }
      // sort by location
      if (value === 'City, Country') {
        this.sortLegalName = 0
        this.sortAge = 0
        this.sortProfession = 0
        switch (this.sortLocation) {
          case 0:
            this.sortLocation = 1
            break
          case 1:
            this.sortLocation = 2
            break
          case 2:
            this.sortLocation = 0
            break
          default:
            this.sortLocation = 0
        }
      }
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
  padding-top:150px;
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

svg#baseSvg {
  cursor: grab;
}

.headers {
  position:fixed;
  top: 100px
}

</style>
