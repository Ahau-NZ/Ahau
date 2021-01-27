<template>
  <svg id="baseSvg" :width="tableWidth" :height="tableHeight" ref="baseSvg" style="background-color:white"  min-height="500px">
    <g id="zoomable">
      <line x1="60" y1="55" :x2="tableWidth" y2="55" style="stroke-width: 1; stroke: lightgrey;"/>
      <g class="headers" v-for="column in columns" :key="column.label">
        <text :transform="`translate(${column.x + 10} ${50})`">
          {{ computeLabel(column.label) }}
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
            <rect :x="node.x + nodeRadius" :y="node.y" :width="tableWidth" :height="nodeRadius*2" class="row" :style="node.color" :id="node.data.id" />
            <Node
              :width="colWidth"
              :node="node"
              :radius="nodeRadius"
              :nodeCentered="nodeCentered"
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
            <svg :width="columns[2].x - 45" >
              <text  :transform="`translate(${columns[1].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ altNames(node.data.altNames) }}
              </text>
            </svg>
            <svg :width="columns[3].x - 45">
              <text  :transform="`translate(${columns[2].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.age }}
              </text>
            </svg>
            <svg :width="columns[4].x - 45">
              <text  :transform="`translate(${columns[3].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ computeDate('dob', node.data.aliveInterval) }} <!-- {{ node.data.aliveInterval.substring(0,10)  }} -->
              </text>
            </svg>
            <svg :width="columns[5].x - 45">
              <text  :transform="`translate(${columns[4].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ computeDate('dod', node.data.aliveInterval) }}<!-- {{ node.data.aliveInterval.substring(11,21) }} -->
              </text>
            </svg>
            <svg :width="columns[6].x - 45">
              <text  :transform="`translate(${columns[5].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.profession }}
              </text>
            </svg>
            <svg :width="columns[7].x - 45">
              <text  :transform="`translate(${columns[6].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.address }}
              </text>
            </svg>
            <svg :width="columns[8].x - 45">
              <text  :transform="`translate(${columns[7].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.location }}
              </text>
            </svg>
            <svg :width="columns[9].x - 45">
              <text :transform="`translate(${columns[8].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.email }}
              </text>
            </svg>
            <svg>
              <text :transform="`translate(${columns[9].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
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
import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'
import { mapGetters, mapActions } from 'vuex'
import { dateIntervalToString } from '@/lib/date-helpers.js'
import { SORT } from '@/lib/constants.js'

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
    searchNodeEvent: {
      required: false
    },
    pan: {
      type: Number,
      default: 0
    },
    searchFilterString: {
      type: String,
      default: ''
    },
    sortValue: {
      type: String,
      default: null
    },
    sortEvent: {
      type: MouseEvent,
      required: false,
      default: null
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

      // 0 = no sort, 1 = sort ascending, 2 = sort descending
      sort: {
        preferredName: SORT.default,
        legalName: SORT.default,
        age: SORT.default,
        profession: SORT.default,
        location: SORT.default
      },
      nodeCentered: ''
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
          return this.determineSort(a, b)
        })
        // filter deceased
        .filter(peeps => {
          if (this.filter && peeps.data.deceased) {
            return false
          }
          return true
        })
        .filter(d => {
          if (this.searchFilterString) {
            const search = this.setString(this.searchFilterString)
            const preferredName = this.setString(d.data.preferredName)
            const legalName = this.setString(d.data.legalName)

            var altNameMatch = false
            const altNames = d.data.altNames
            if (altNames.length > 0) {
              for (var i = 0; i < altNames.length; i++) {
                const currAltName = this.setString(altNames[i])
                console.log('curr alt name: ', currAltName)
                console.log('search: ', search)
                if (isEqual(currAltName, search) || currAltName.includes(search)) {
                  altNameMatch = true
                }
              }
            }

            if (
              isEqual(preferredName, search) ||
              preferredName.includes(search) ||
              isEqual(legalName, search) ||
              legalName.includes(search) ||
              altNameMatch
            ) {
              return true
            } else {
              return false
            }
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
            y: (this.filter || this.searchFilterString) ? i * 45 : d.y * 1.5,
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
          label: 'Alt Name',
          x: this.colWidth + 200
        },
        {
          label: 'Age',
          x: this.colWidth + 400
        },
        {
          label: 'D.O.B',
          x: this.colWidth + 470
        },
        {
          label: 'D.O.D',
          x: this.colWidth + 600
        },
        {
          label: 'Profession',
          x: this.colWidth + 730
        },
        {
          label: 'Address',
          x: this.colWidth + 1000
        },
        {
          label: 'City, Country',
          x: this.colWidth + 1405
        },
        {
          label: 'Email',
          x: this.colWidth + 1645
        },
        {
          label: 'Phone',
          x: this.colWidth + 2005
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
    },

    // Triggered whenever the user selects a sort
    sortEvent () {
      this.resetSorts(this.sortValue)
      this.setSortOnField(this.sortValue)
    },
    searchNodeEvent (newValue) {
      if (this.searchNodeId !== null) {
        this.root.descendants().find(d => {
          if (d.data.id === this.searchNodeId) {
            this.centerNode(d)
          }
        })
      }
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
    setString (name) {
      if (isEmpty(name)) return ''
      return name.toLowerCase().trim()
    },
    altNames (altArray) {
      var altNames = ''

      for (var i = 0; i < altArray.length; i++) {
        if (altNames.length === 0) {
          altNames += altArray[i]
        } else {
          altNames += ', ' + altArray[i]
        }
      }

      return altNames
    },
    computeDate (requiredDate, age) {
      if (!age) {
        return ''
      }

      var ageString = ''
      const dateSplit = dateIntervalToString(age).split('-')

      if (requiredDate === 'dob') {
        if (dateSplit[0]) {
          ageString = dateSplit[0]
        }
      }
      if (requiredDate === 'dod') {
        if (dateSplit[1]) {
          ageString = dateSplit[1]
        }
      }

      return ageString
    },
    // Toggles the sort on the current field between ascending, descending and no sort
    setSortOnField (field) {
      const currentSort = this.sort[field]
      switch (currentSort) {
        case SORT.default:
          this.sort[field] = SORT.ascending
          break
        case SORT.ascending:
          this.sort[field] = SORT.descending
          break
        case SORT.descending:
        default:
          this.sort[field] = SORT.default
      }
    },
    // When a sort is triggered, ensures all other sorts are disabled
    resetSorts (ignoredKey) {
      Object.keys(this.sort).forEach(key => {
        if (key === ignoredKey) return
        this.sort[key] = SORT.default
      })
    },
    // Computes the label of table headers depending on whether a sort is active
    computeLabel (label) {
      if (label === 'Address') {
        return 'Address'
      }
      if (label === 'Email') {
        return 'Email'
      }
      if (label === 'Phone') {
        return 'Phone'
      }

      const legalName = ['Legal Name', 'Legal Name ↑', 'Legal Name ↓']
      const age = ['Age', 'Age ↑', 'Age ↓']
      const profession = ['Profession', 'Profession ↑', 'Profession ↓']
      const location = ['City, Country', 'City, Country ↑', 'City, Country ↓']

      if (label === 'Legal Name') {
        return legalName[this.sort['legalName']]
      }
      if (label === 'Age') {
        return age[this.sort['age']]
      }
      if (label === 'Profession') {
        return profession[this.sort['profession']]
      }
      if (label === 'City, Country') {
        return location[this.sort['location']]
      }

      return ''
    },
    // Executes a sort on two values
    sortByField (a, b) {
      const sort = this.sort[this.sortValue]
      if (sort !== SORT.default) {
        if (sort === SORT.ascending) {
          if (a < b) { return -1 }
          if (a > b) { return 1 }
          return 0
        }
        if (sort === SORT.descending) {
          if (a > b) { return -1 }
          if (a < b) { return 1 }
          return 0
        }
      }
    },
    // Determines the sort to be performed depending on the field to be sorted
    determineSort (a, b) {
      const field = this.sortValue
      if (field === null || field === '') {
        return
      }
      let aVal, bVal

      switch (field) {
        case 'age':
          aVal = this.convertNullAgeToValue(calculateAge(a.data.aliveInterval))
          bVal = this.convertNullAgeToValue(calculateAge(b.data.aliveInterval))
          return this.sortByField(aVal, bVal)
        default: // Preferred name or location
          aVal = a.data[field]
          bVal = b.data[field]
      }
      aVal = this.convertNullToChar(aVal)
      bVal = this.convertNullToChar(bVal)

      return this.sortByField(this.removeMacron(aVal.toLowerCase()), this.removeMacron(bVal.toLowerCase()))
    },
    // Hacky way to get empty/null fields to display below non-empty sorted fields
    convertNullToChar (val) {
      if (val !== null && val !== '') return val
      const sort = this.sort[this.sortValue]
      if (sort === SORT.ascending) {
        return 'ZZZZZ'
      }
      if (sort === SORT.descending) {
        return 'AAAAA'
      }
      return ''
    },
    // Hacky way to get empty/null ages to display below non-empty sorted ages
    convertNullAgeToValue (val) {
      if (val !== null && val !== '') return val
      const sort = this.sort[this.sortValue]
      if (sort === SORT.ascending) {
        return 9999
      }
      if (sort === SORT.descending) {
        return 0
      }
      return ''
    },
    // Replaces characters with macrons with their non-macron equivalent so that strings are sorted properly
    removeMacron (str) {
      const macronArray = ['ā', 'ē', 'ī', 'ō', 'ū', 'Ā', 'Ē', 'Ī', 'Ō', 'Ū']
      const nonMacronArray = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']

      var newString = ''
      for (var i = 0; i < str.length; i++) {
        var macronFound = false
        const currChar = str[i]
        for (var j = 0; j < macronArray.length; j++) {
          if (currChar === macronArray[j]) {
            macronFound = true
            newString += nonMacronArray[j]
          }
        }
        if (!macronFound) {
          newString += currChar
        }
      }

      return newString
    },
    centerNode (node) {
      const element = document.getElementById(`${node.data.id}`)
      const coord = element.getBoundingClientRect()

      const elementPos = window.pageYOffset + coord.y - 400

      window.scrollTo({
        top: elementPos,
        behavior: 'smooth'
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
