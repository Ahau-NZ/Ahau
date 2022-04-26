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
            <svg :width="columns[4].x - 45" >
              <text :transform="`translate(${columns[3].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ altNames(node.data.altNames) }}
              </text>
            </svg>
            <svg :width="columns[5].x - 45">
              <text  :transform="`translate(${columns[4].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.age }}
              </text>
            </svg>
            <svg :width="columns[6].x - 45">
              <text  :transform="`translate(${columns[5].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ computeDate('dob', node.data.aliveInterval) }}
              </text>
            </svg>
            <svg :width="columns[7].x - 45">
              <text  :transform="`translate(${columns[6].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ computeDate('dod', node.data.aliveInterval) }}
              </text>
            </svg>
            <svg :width="columns[8].x - 45">
              <text  :transform="`translate(${columns[7].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.profession }}
              </text>
            </svg>
            <svg v-if="node.data && node.data.adminProfile" :width="columns[9].x - 45">
              <text  :transform="`translate(${columns[8].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.address }}
              </text>
            </svg>
            <svg :width="columns[10].x - 45">
              <text  :transform="`translate(${columns[9].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.city }}
              </text>
            </svg>
            <svg :width="columns[11].x - 45">
              <text  :transform="`translate(${columns[10].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.postCode }}
              </text>
            </svg>
            <svg :width="columns[12].x - 45">
              <text  :transform="`translate(${columns[11].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.country }}
              </text>
            </svg>
            <svg :width="columns[13].x - 45">
              <text  :transform="`translate(${columns[12].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.placeOfBirth }}
              </text>
            </svg>
            <svg :width="columns[14].x - 45">
              <text :transform="`translate(${columns[13].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.placeOfDeath }}
              </text>
            </svg>
            <svg v-if="node.data.email">
              <text :transform="`translate(${columns[14].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.email }}
              </text>
            </svg>
            <svg v-if="node.data.phone">
              <text :transform="`translate(${columns[15].x - nodeSize + 10} ${node.y + nodeRadius + 5})`">
                {{ node.data.phone }}
              </text>
            </svg>
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

import isEmpty from 'lodash.isempty'
import isEqual from 'lodash.isequal'

import Node from './Node.vue'
import Link from '../tree/Link.vue'

import calculateAge from '../../lib/calculate-age.js'
import { dateIntervalToString } from '@/lib/date-helpers.js'
import { mergeAdminProfile } from '@/lib/person-helpers.js'

import { SORT } from '@/lib/constants.js'
import { mapNodesToCsv } from '@/lib/csv.js'

export default {
  name: 'WhakapapaTable',
  props: {
    searchNodeId: String,
    searchNodeEvent: {
      required: false
    },
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
    const { loadPersonFull } = this

    // NOTE we use an async iterator here because with something like Promise.all
    // it would try to ram all descendants through graphql query and crash the app
    // with a big tree.
    // This is like pull-streams but with async-await (ugly aye)

    async function * generateLoader (nodes) {
      for (let i = 0; i < nodes.length; i++) {
        await loadPersonFull(nodes[i].data.id)
        await Promise.all(
          nodes[i].partners
            .map(node => loadPersonFull(node.data.id))
        )
        yield i
      }
    }

    const generator = generateLoader(this.descendants)
    for await (let i of generator) { // eslint-disable-line
      // could update a progres
    }
    // could update 'done loading' here
  },

  computed: {
    ...mapGetters('whakapapa', ['whakapapaView', 'getPartnerIds']),
    ...mapGetters('table', ['descendants', 'descendantLinks', 'tableFilter', 'tableSort', 'tableFlatten']),
    ...mapGetters('person', ['person']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    colWidth () {
      if (this.tableFlatten) return 300
      return 350
    },
    pathNode () {
      if (this.searchNodeId === '') return null
      return this.descendants
        .find(d => {
          return d.data.id === this.searchNodeId
        })
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
          const profileId = node.data.id
          const profile = mergeAdminProfile(this.person(profileId))
          const partners = this.getPartnerIds(profileId)
            .map(partnerId => this.person(partnerId))

          return {
            ...node,
            data: {
              ...node.data,
              ...profile,
              partners
            }
          }
        })
        .filter(d => this.determineFilter(d))

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
        { label: this.t('phone'), x: this.colWidth + 2550 }
      ]
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
    searchNodeEvent () {
      if (!this.searchNodeId) return

      const node = this.descendants
        .some(d => d.data.id === this.searchNodeId)

      if (node) this.centerNode(node)
    },
    download (newVal) {
      if (newVal) {
        const csv = mapNodesToCsv(this.nodes)

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
      } else if (data.id === this.searchNodeId) {
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
    setString (name) {
      if (isEmpty(name)) return ''
      return name.toLowerCase().trim()
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
    // TODO: move these filters into table vuex
    determineFilter (node) {
      if (this.tableFilter.deceased && node.data.deceased) return false

      return (
        this.nameMatchesFilter(node) &&
        this.locationMatchesFilter(node) &&
        this.skillsMatchesFilter(node) &&
        this.filterByAge(node)
      )
    },
    nameMatchesFilter (node) {
      if (!this.tableFilter.name) return true

      const search = this.setString(this.tableFilter.name)
      const preferredName = this.setString(node.data.preferredName)
      const legalName = this.setString(node.data.legalName)

      return preferredName.includes(search) ||
            legalName.includes(search) ||
            this.findAltNameMatch(search, node.data.altNames)
    },
    findAltNameMatch (filterString, altNames) {
      let altNameFound = false

      if (altNames && altNames.length > 0) {
        for (let i = 0; i < altNames.length; i++) {
          const currAltName = this.setString(altNames[i])
          if (currAltName.includes(filterString)) altNameFound = true
        }
      }
      return altNameFound
    },
    locationMatchesFilter (node) {
      if (!this.tableFilter.location) return true

      const search = this.setString(this.tableFilter.location)
      const address = this.setString(node.data.address)
      const city = this.setString(node.data.city)
      const postCode = this.setString(node.data.postCode)
      const country = this.setString(node.data.country)

      return address.includes(search) ||
            city.includes(search) ||
            postCode.includes(search) ||
            country.includes(search)
    },
    skillsMatchesFilter (node) {
      if (!this.tableFilter.skills) return true

      const skills = node.data.education
      const profession = this.setString(node.data.profession)
      const search = this.setString(this.tableFilter.skills)
      let skillFound = false

      if (skills && skills.length && skills[0] !== '') {
        for (let i = 0; i < skills.length; i++) {
          const currSkill = this.setString(skills[i])
          if (currSkill.includes(search)) skillFound = true
        }
      }

      return skillFound || profession.includes(search)
    },
    filterByAge (node) {
      if (!(this.tableFilter.age.max < 150)) return true

      const min = this.tableFilter.age.min
      const max = this.tableFilter.age.max

      const nodeAge = calculateAge(node.data.aliveInterval)
      if (!nodeAge) return false
      if (nodeAge >= min && nodeAge <= max) return true
      else return false
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
