<template>
  <svg id="baseSvg" width="100%" :height="height" ref="baseSvg">
    <g id="baseGroup">
      <g :transform="`translate(${treeX - radius} ${treeY - radius})`" ref="tree" >
        <SubTree v-if="tree"
          :root="tree"
          :changeFocus="changeFocus"
          :centerNode="centerNode"
          :showAvatars="showAvatars"
        />
      </g>
    </g>
    <!-- zoom in, zoom out buttons -->
    <g class="zoomControl">
      <g>
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="grey" flood-opacity="0.5"/>
          </filter>
        </defs>
      </g>
      <g @click="zoomReset()" :transform="mobile ? `translate(${15} ${treeY*3})` : `translate(${30} ${treeY*3.1})`">
        <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
        <circle stroke="black" fill="white" filter="url(#shadow)" cx="20" cy="1" r="5"/>
        <path d="M 20,-7 20,10 M 12,1 28,1" stroke="grey" stroke-width="1.5" />
      </g>
      <g @click="zoomInOut(1.6)" :transform="mobile ? `translate(${15} ${treeY*3.35})` : `translate(${30} ${treeY*3.4})`">
        <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
        <path d="M 20,-5 20,7 M 14,1 26,1" stroke="grey" stroke-width="1.5" />
      </g>
      <g @click="zoomInOut(1 / 1.6)" :transform="mobile ? `translate(${15} ${treeY*3.7})` : `translate(${30} ${treeY*3.7})`">
        <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
        <path d="M 14,1 26,1" stroke="grey" stroke-width="1.5" />
      </g>
    </g>
  </svg>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as d3 from 'd3'
import isEqual from 'lodash.isequal'

import SubTree from './SubTree'
import settings from '@/lib/link.js'

export default {
  props: {
    searchNodeId: String,
    getRelatives: Function,
    showAvatars: Boolean
  },
  components: {
    SubTree
  },
  data () {
    return {
      componentLoaded: false, // need to ensure component is loaded before using $refs
      nodeCentered: '', // hold centered node id

      nonFocusedPartners: [],
      changeFocusId: null,
      nodeId: '',
      lastNode: null
    }
  },
  mounted () {
    this.componentLoaded = true
    // set loader until all the nodes have been loaded
    this.zoom()
    this.scale()
  },

  computed: {
    ...mapGetters('whakapapa', ['nestedWhakapapa']),
    ...mapGetters('tree', ['tree', 'descendants']),
    radius () {
      return settings.radius
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    pathNode () {
      if (this.searchNodeId === '') return null
      return this.descendants.find(d => d.data.id === this.searchNodeId)
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
      return this.$refs.baseSvg.clientHeight / 4
    },
    width () {
      return screen.width
    },
    height () {
      return screen.height
    },
    paths () {
      if (!this.componentLoaded || !this.pathNode) return null
      return this.root.path(this.pathNode)
        .map(d => d.data.id)
    }
  },
  watch: {
    searchNodeId (newVal) {
      if (newVal === '') return null

      const node = this.descendants.find(node => node.data.id === newVal)
      if (node) this.centerNode(node)
    }
  },

  methods: {
    ...mapActions(['setLoading']),
    ...mapActions('whakapapa', ['toggleNodeCollapse']),
    pathStroke (sourceId, targetId) {
      if (!this.paths) return 'darkgrey'

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
      return 'darkgrey'
    },

    async checkNonFocusedPartner (profile) {
      if (profile.partners && profile.partners.length > 0) {
        for await (const partner of profile.partners) {
          const relatives = await this.getRelatives(partner.id)
          if (relatives.parents && relatives.parents.length > 0) {
            this.nonFocusedPartners = [...this.nonFocusedPartners, partner.id]
          }
        }
      }
      if (profile.children) {
        for await (const child of profile.children) {
          await this.checkNonFocusedPartner(child)
        }
      }
    },

    changeFocus (profileId) {
      this.changeFocusId = profileId
      this.$emit('change-focus', profileId)
    },
    zoom () {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      svg.call(
        d3.zoom()
          .scaleExtent([0.05, 2])
          .on('zoom', function () {
            g.attr('transform', d3.event.transform)
          })
      )
        .on('dblclick.zoom', null)
    },
    scale () {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')
      var zoom = d3.zoom()
        .on('zoom', function () {
          g.attr('transform', d3.event.transform)
        })
      zoom.scaleBy(svg.transition().duration(0), 0.8)
    },

    centerNode (node) {
      // if node is already centered than collapse
      if (this.nodeCentered === node.data.id) {
        this.toggleCollapse(node)
        return
      }

      this.nodeCentered = node.data.id

      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      var width = this.$refs.tree.clientWidth
      var height = this.$refs.tree.clientHeight

      var x = width / 2 - node.x
      var y = height / 2 - node.y + 150

      g.transition()
        .duration(700)
        .attr('transform', 'translate(' + (x) + ',' + (y) + ')')
        .on('end', function () { svg.call(d3.zoom().transform, d3.zoomIdentity.translate((x), (y))) })
    },
    toggleCollapse (node) {
      const profile = node.data
      this.toggleNodeCollapse(profile.id)

      const { children, _children = [] } = profile

      if (children.length === 0 && _children.length === 0) return

      Object.assign(profile, {
        _children: children,
        children: _children
      })

      // find the node position now
      var _node = this.descendants.find(d => d.data.id === node.data.id)

      // setTimeout needed to get new node position after it has finished collapsing/expanding
      setTimeout(() => {
        var svg = d3.select('#baseSvg')
        var g = d3.select('#baseGroup')

        var width = this.$refs.tree.clientWidth
        var height = this.$refs.tree.clientHeight

        var x = width / 2 - _node.x
        var y = height / 2 - _node.y + 150

        g.transition()
          .duration(700)
          .attr('transform', `translate(${x}, ${y})`)
          .on('end', function () { svg.call(d3.zoom().transform, d3.zoomIdentity.translate((x), (y))) })
      }, 100)
    },
    zoomInOut (scale) {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      var zoom = d3.zoom()
        .scaleExtent([0.05, 2])
        .on('zoom', function () {
          g.attr('transform', d3.event.transform)
        })

      zoom.scaleBy(svg.transition().duration(150), scale)
    },
    zoomReset () {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')

      var width = this.$refs.tree.clientWidth
      var height = this.$refs.tree.clientHeight
      g.transition()
        .duration(400)
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')scale(' + 1 + ')')
        .on('end', function () {
          svg.call(
            d3.zoom().transform,
            d3.zoomIdentity.translate((width / 2), (height / 2))
              .scale(1)
          )
        })
    }
  }
}
</script>

<style scoped lang="scss">
#background {
  opacity: 0.1;
}

svg#baseSvg {
  cursor: grab;
  background: linear-gradient(rgba(255, 255, 255, 0.99), rgba(255, 255, 255, 0.88)), url(../../assets/niho.svg);
  background-repeat: no-repeat;
  background-size: cover;
}

.zoomControl {
  cursor: pointer;
}

</style>
