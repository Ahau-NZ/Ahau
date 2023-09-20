<template>
  <div ref="tablediv" :class="mobile ? 'mobile-table' : 'whakapapa-table'" v-scroll.self="onscroll">
    <svg id="baseSvg" :width="tableWidth" :height="tableHeight" ref="baseSvg" style="background-color:white"  min-height="500px">
      <g id="zoomable">
        <line x1="60" y1="55" :x2="tableWidth" y2="55" style="stroke-width: 1; stroke: lightgrey;"/>
        <g class="headers" v-for="(column, i) in columns" :key="column.label">
          <text :transform="`translate(${column.x + 10} ${50})`">
            {{ computeLabel(column.label) }}
          </text>
          <line v-if="i !== 0" :x1="column.x" y1="55" :x2="column.x" :y2="tableHeight" style="stroke-width: 1; stroke: lightgrey;"/>
        </g>
        <svg id="baseGroup" :width="tableWidth">
          <g v-if="!tableFlatten" :transform="`translate(${60} ${80})`">
            <g v-for="link in links" :key="link.id" class="link">
              <Link :link="link" :class="link.class"/>
            </g>
          </g>
          <g
            :transform="`translate(${60 - nodeRadius} ${80 - nodeRadius})`"
            ref="tree"
          >
            <g v-for="(node, i) in nodes" :key="`table-${node.data.id}-${i}`" class="node">
              <rect :x="node.x + nodeRadius" :y="node.y" :width="tableWidth" :height="nodeRadius*2" class="row" :style="nodeColor(node.data)" :id="node.data.id" />
              <Node
                :width="colWidth"
                :node="node"
                :radius="nodeRadius"
                @center="centerNode(node)"
                :showLabel="true"
              />
              <g v-if="tableFlatten && node.data.isCollapsed" :transform="`translate(${node.x - 10} ${node.y + nodeRadius + 5})`">
                <text> + </text>
              </g>
              <g v-if="tableFlatten && node.data.children && node.data.children.length > 0" :transform="`translate(${node.x - 10} ${node.y + nodeRadius + 5})`">
                <text> - </text>
              </g>
              <svg :width="columns[2].x - 45" >
                <text  :transform="`translate(${columns[1].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                  {{ node.data.preferredName }}
                </text>
              </svg>
              <svg :width="columns[3].x - 40" >
                <g v-if="node.data.partners && node.data.partners.length > 0">
                  <g v-for="(partner, i) in node.data.partners" :key="`${node.data.id}-partner-${partner && partner.id ? partner.id : ''}-${i}`">
                    <Node
                      v-if="partner && partner.id"
                      :id="partner.id"
                      :width="columns[4].x"
                      :node="{ ...partner, x: columns[2].x - nodeSize + 5 + (nodeSize * i), y: node.y }"
                      :radius="nodeRadius * 0.9"
                      isPartner
                      :hideLabel="node.data.partners.length > 1"
                      @open="updateDialog($event)"
                    />
                  </g>
                </g>
              </svg>
              <g v-for="field in defaultFields" :key="`${node.data.id}-${field.key}-1`">
                <svg :width="field.width">
                  <text :transform="field.getTransform(node)" :style="`max-width: ${field.width}px;`">
                    {{ field.getValue(node) }}
                  </text>
                </svg>
              </g>
              <g v-for="field in customFields" :key="`${node.data.id}-${field.key}-2`">
                <svg :width="field.width">
                  <text :transform="field.getTransform(node)" :style="`max-width: ${field.width}px;`">
                    {{ field.getValue(node) }}
                  </text>
                </svg>
              </g>
            </g>
          </g>
        </svg>
      </g>
    </svg>
  </div>
</template>

<script>
import { pairs as d3Pairs } from 'd3'
import { mapGetters, mapActions } from 'vuex'

import { isEmpty, isEqual, get } from 'lodash-es'

import Node from './Node.vue'
import Link from '../tree/Link.vue'

import calculateAge from '../../lib/calculate-age'
import { dateIntervalToString } from '@/lib/date-helpers'
import { mergeAdminProfile } from '@/lib/person-helpers'
import { determineFilter } from '@/lib/filters'
import { getDefaultFieldValue } from '@/lib/custom-field-helpers'

import { SORT } from '@/lib/constants'
import { mapNodesToCsv } from '@/lib/csv'

export default {
  name: 'WhakapapaTable',
  props: {
    download: Boolean
  },
  data () {
    return {
      tableWidth: 0,
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
        country: SORT.default
      },
      sortActive: false,
      scrollTop: ''
    }
  },
  async mounted () {
    this.componentLoaded = true
    this.tableOverflow()

    // HACKY 2022-07-11 mix
    // uncollapse all nodes - needed to ensure all nodes are in d3 tree
    this.setAutoCollapse(false)
  },

  computed: {
    ...mapGetters('tree', ['searchedProfileId', 'mouseEvent']),
    ...mapGetters('whakapapa', ['whakapapaView', 'getPartnerIds']),
    ...mapGetters('table', ['descendants', 'descendantLinks', 'tableFilter', 'tableSort', 'tableFlatten']),
    ...mapGetters('person', ['person']),
    ...mapGetters('tribe', ['tribeCustomFields']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    colWidth () {
      if (this.tableFlatten) return 300
      return 350
    },
    pathNode () {
      if (!this.searchedProfileId) return null
      return this.descendants.find(d => d.data.id === this.searchedProfileId)
    },
    // table height based on number of nodes on table
    tableHeight () {
      if (!this.componentLoaded) return 0
      return (this.nodes.length + 1) * 52 + 100
    },

    // returns an array of nodes associated with the root node created from the treeData object, as well as extra attributes
    nodes () {
      const nodes = this.descendants
        .map(node => {
          return {
            ...node,
            data: {
              ...node.data,
              ...mergeAdminProfile(this.person(node.data.id)),
              partners: this.getPartnerIds(node.data.id).map(partnerId => this.person(partnerId))
            }
          }
        })
        .filter(d => determineFilter(d, this.tableFilter))

      if (this.sortActive) {
        nodes
          .sort((a, b) => this.determineSort(a, b))
      }

      return nodes
        // returns a new custom object for each node
        .map((node, i) => {
          // set width of first column
          this.setWidth(node.depth)
          return {
            ...node,
            y: this.tableFlatten ? i * 45 : node.y * 1.5
          }
        })
    },

    /*
      returns an array of links which holds the X and Y coordinates of both the parent (source) and child (target) nodes
    */
    links () {
      return this.descendantLinks
        .map((d, i) => { // returns a new custom object for each link
          return {
            id: `table-link-${i}-${d.target.data.id}`,
            index: i,
            relationshipType: d.target.data.relationshipType ? d.target.data.relationshipType : '',
            class: d.target.data.relationshipType !== 'birth' ? 'nonbiological' : '',
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
          const A = a.style.stroke
          const B = b.style.stroke
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
        { label: this.t('fullName'), x: 80 },
        { label: this.t('preferredName'), x: this.colWidth },
        { label: this.t('partners'), x: this.colWidth + 200 },
        { label: this.t('aka'), x: this.colWidth + 400 },
        { label: this.t('age'), x: this.colWidth + 600 },
        { label: this.t('dob'), x: this.colWidth + 650 },
        { label: this.t('dod'), x: this.colWidth + 775 },
        { label: this.t('profession'), x: this.colWidth + 900 },
        { label: this.t('address'), x: this.colWidth + 1100 },
        { label: this.t('city'), x: this.colWidth + 1400 },
        { label: this.t('postCode'), x: this.colWidth + 1600 },
        { label: this.t('country'), x: this.colWidth + 1700 },
        { label: this.t('pob'), x: this.colWidth + 1900 },
        { label: this.t('pod'), x: this.colWidth + 2100 },
        { label: this.t('email'), x: this.colWidth + 2300 },
        { label: this.t('phone'), x: this.colWidth + 2550 },

        // custom field columns
        ...this.tribeCustomFields
          .map((field, i) => {
            return {
              label: field.label,
              x: this.colWidth + (2750 + (i * 200))
            }
          })
      ]
    },
    defaultFields () {
      return [
        this.defaultFieldValue('aka', node => this.altNames(node.data.altNames)),
        this.defaultFieldValue('age', node => calculateAge(node.data.aliveInterval)),
        this.defaultFieldValue('dob', node => this.computeDate('dob', node.data.aliveInterval)),
        this.defaultFieldValue('dod', node => this.computeDate('dob', node.data.aliveInterval)),
        this.defaultFieldValue('profession'),
        this.defaultFieldValue('address'),
        this.defaultFieldValue('city'),
        this.defaultFieldValue('postCode'),
        this.defaultFieldValue('country'),
        this.defaultFieldValue('pob', node => node.data.placeOfBirth),
        this.defaultFieldValue('pod', node => node.data.placeOfDeath),
        this.defaultFieldValue('email'),
        this.defaultFieldValue('phone')
      ]
        .filter(Boolean)
    },
    customFields () {
      return this.tribeCustomFields
        .map(fieldDef => {
          return this.defaultFieldValue(fieldDef.label, node => this.getCustomFieldValue(node, fieldDef), true)
        })
        .filter(Boolean)
    }
  },

  watch: {
    nodes () {
      this.setLoading(false)
    },
    tableSort: {
      deep: true,
      handler () {
        this.resetSorts(this.tableSort.value)
        this.setSortOnField(this.tableSort.value)
      }
    },
    mouseEvent () {
      if (!this.searchedProfileId) return

      const node = this.descendants
        .find(d => d.data.id === this.searchedProfileId)

      if (node) this.centerNode(node)
    },
    download (newVal) {
      if (newVal) {
        const csv = mapNodesToCsv(this.nodes, this.tribeCustomFields)

        this.$emit('update:download', false)

        const hiddenElement = document.createElement('a')
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
        hiddenElement.target = '_blank'
        hiddenElement.download = this.whakapapaView.name + '.csv'
        hiddenElement.click()
      }
    }
  },
  methods: {
    ...mapActions(['setLoading']),
    ...mapActions('whakapapa', ['setAutoCollapse']),
    ...mapActions('person', ['loadPersonFull']),
    // sets the width of the table
    onscroll (e) {
      this.scrollTop = e.target.scrollTop
    },
    async tableOverflow () {
      const width = await this.colWidth + this.columns[this.columns.length - 1].x
      this.tableWidth = width
      this.$emit('update', this.tableWidth)
    },
    defaultFieldValue (key, getValue, isCustomField = false) {
      if (!this.columns) return

      const label = isCustomField ? key : this.t(key)
      const index = this.columns.findIndex(column => column.label === label)
      if (index < 0) return

      if (getValue === undefined) {
        getValue = (node) => {
          if (isCustomField) return node.data.customFields[key]
          return node.data[key]
        }
      }

      const field = {
        key,
        getValue,
        getTransform: (node) => `translate(${this.columns[index].x - this.nodeSize + 10} ${node.y + this.nodeRadius + 5})`
      }

      if (index !== (this.columns.length - 1)) field.width = this.columns[index + 1].x - 45

      return field
    },
    getCustomFieldValue (node, fieldDef) {
      const customFields = get(node, 'data.customFields', []) // may not be loaded in the data yet
      // if its an object, we need to convert it
      // TODO: cherese 02/03/23 this is horrible monkey patching, but its a quick and we dont have time to
      // think about the bigger problen
      let customField

      if (Array.isArray(customFields)) {
        customField = customFields.find(field => field.key === fieldDef.key)
      } else {
        customField = customFields[fieldDef.key]
      }

      // if the field wasnt found
      // it could mean that they havent defined a value for it yet
      if (customField === undefined) customField = { value: getDefaultFieldValue(fieldDef) }

      switch (fieldDef.type) {
        case 'array':
          if (get(customField, 'value.length')) return customField.value.join(', ')
          return ''
        case 'list':
          if (fieldDef.multiple) return customField.value.join(', ')
          else return customField.value
        case 'checkbox':
          if (customField.value) return 'yes'
          else return 'no'
        default:
          return customField.value || ''
      }
    },

    // set the width for the first column which needs to be dynamic when showing whakapapa links
    setWidth (depth) {
      if (!this.tableFlatten && depth > 10) {
        this.colWidth = depth * 45 - 100
      }
    },

    pathStroke (sourceId, targetId) {
      if (!this.paths) return 'lightgrey'

      const currentPath = [sourceId, targetId]

      const pairs = d3Pairs(this.paths)
        .filter(d => isEqual(d, currentPath))

      return (pairs.length > 0) ? '#b02425' : 'lightgrey'
    },

    // changes row colour
    nodeColor (data) {
      const age = calculateAge(data.aliveInterval)
      if (data.isCollapsed) {
        return 'fill:cadetblue'
      } else if (age !== null && age < 2) {
        return 'fill:yellow'
      } else if (data.id === this.searchedProfileId) {
        return 'fill:red'
      } else return 'fill:lightblue'
    },

    async collapse (node) {
      const profile = node.data
      const { children = [], _children = [] } = profile

      if (children.length === 0 && _children.length === 0) return

      Object.assign(profile, {
        isCollapsed: !profile.isCollapsed,
        _children: children,
        children: _children
      })
    },
    altNames (altArray) {
      if (isEmpty(altArray)) return ''
      return altArray.join(', ')
    },
    computeDate (requiredDate, age) {
      if (!age) {
        return ''
      }

      let ageString = ''
      const dateSplit = dateIntervalToString(age, this.monthTranslations).split('-')

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
    monthTranslations (key, vars) {
      return this.$t('months.' + key, vars)
    },
    // Toggles the sort on the current field between ascending, descending and no sort
    setSortOnField (field) {
      const currentSort = this.sort[field]
      switch (currentSort) {
        case SORT.default:
          this.sort[field] = SORT.ascending
          this.sortActive = true
          break
        case SORT.ascending:
          this.sort[field] = SORT.descending
          this.sortActive = true
          break
        case SORT.descending:
        default:
          this.sort[field] = SORT.default
          this.sortActive = false
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
      if (label === '') return ''

      const preferredName = ['Preferred Name', 'Preferred Name ↑', 'Preferred Name ↓']
      const age = ['Age', 'Age ↑', 'Age ↓']
      const profession = ['Profession', 'Profession ↑', 'Profession ↓']
      const country = ['Country', 'Country ↑', 'Country ↓']

      if (label === 'Preferred Name') return preferredName[this.sort.preferredName]
      if (label === 'Age') return age[this.sort.age]
      if (label === 'Profession') return profession[this.sort.profession]
      if (label === 'Country') return country[this.sort.country]

      return label
    },
    // Executes a sort on two values
    sortByField (a, b) {
      const sort = this.sort[this.tableSort.value]
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
    // TODO: move these sorts to vuex
    // Determines the sort to be performed depending on the field to be sorted
    determineSort (a, b) {
      const field = this.tableSort.value
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
      const sort = this.sort[this.tableSort.value]
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
      const sort = this.sort[this.tableSort.value]
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

      let newString = ''
      for (let i = 0; i < str.length; i++) {
        let macronFound = false
        const currChar = str[i]
        for (let j = 0; j < macronArray.length; j++) {
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
      const div = this.$refs.tablediv
      const element = document.getElementById(`${node.data.id}`)
      const coord = element.getBoundingClientRect()
      const elementPos = this.scrollTop + coord.y - 400
      div.scrollTo({
        top: elementPos,
        behavior: 'smooth'
      })
    },
    updateDialog ($event) {
      this.$emit('open', $event)
    },
    t (key, vars) {
      return this.$t('viewTribalRegistry.' + key, vars)
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
  @media screen and (max-width: 420px) {
    padding-top: 20px;
  }
  @media screen and (min-width: 421px) {
    padding-top: 150px;
  }
  // padding-top:150px;
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

.whakapapa-table {
  overflow: auto;
  width: 100%;
  padding-top: 50px;
  height: 100vh;
  margin-top: -2px //needed to hide parent scrollbar
}

.mobile-table {
  overflow: auto;
  width: 100%;
}

</style>
