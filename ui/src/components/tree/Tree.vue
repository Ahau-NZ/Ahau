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
import {
  select as d3Select,
  zoom as d3Zoom,
  zoomIdentity as d3ZoomIdentity,
  event as d3Event
} from 'd3'

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
  beforeDestroy () {
    if (!this.whakapapaView) return
    if (this.whakapapaView.name === 'Loading') return
    if (!this.whakapapaView.canEdit) return

    if (!this.whakapapaView.id) {
      console.warn('Trying to save the record count without a whakapapa id', this.whakapapaView)
      return
    }

    const profileCount = this.tree.value
    if (!profileCount) return
    if (this.whakapapaView.recordCount === profileCount) return

    // if there are more records here than are recorded, update the whakapapa-view
    this.saveWhakapapaView({
      id: this.whakapapaView.id,
      recordCount: profileCount
    })
  },

  computed: {
    ...mapGetters('whakapapa', ['whakapapaView']),
    ...mapGetters('tree', ['tree', 'getNode', 'getPartnerNode']),
    radius () {
      return settings.radius
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
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
    }
  },
  watch: {
    searchNodeId (id) {
      if (id === '') return null

      const node = this.getNode(id) || this.getPartnerNode(id)
      if (node) this.centerNode(node)
    }
  },

  methods: {
    ...mapActions(['setLoading']),
    ...mapActions('whakapapa', ['saveWhakapapaView', 'toggleNodeCollapse']),

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
      var svg = d3Select('#baseSvg')
      var g = d3Select('#baseGroup')

      svg.call(
        d3Zoom()
          .scaleExtent([0.05, 2])
          .on('zoom', function () {
            g.attr('transform', d3Event.transform)
          })
      )
        .on('dblclick.zoom', null)
    },
    scale () {
      var svg = d3Select('#baseSvg')
      var g = d3Select('#baseGroup')
      var zoom = d3Zoom()
        .on('zoom', function () {
          g.attr('transform', d3Event.transform)
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

      var svg = d3Select('#baseSvg')
      var g = d3Select('#baseGroup')

      var width = this.$refs.tree.clientWidth
      var height = this.$refs.tree.clientHeight

      var x = width / 2 - node.x
      var y = height / 2 - node.y + 150

      g.transition()
        .duration(700)
        .attr('transform', 'translate(' + (x) + ',' + (y) + ')')
        .on('end', function () { svg.call(d3Zoom().transform, d3ZoomIdentity.translate((x), (y))) })
    },
    toggleCollapse (node) {
      const profile = node.data
      this.toggleNodeCollapse(profile.id)

      // find the node position now
      var _node = this.descendants.find(d => d.data.id === node.data.id)

      // setTimeout needed to get new node position after it has finished collapsing/expanding
      setTimeout(() => {
        var svg = d3Select('#baseSvg')
        var g = d3Select('#baseGroup')

        var width = this.$refs.tree.clientWidth
        var height = this.$refs.tree.clientHeight

        var x = width / 2 - _node.x
        var y = height / 2 - _node.y + 150

        g.transition()
          .duration(700)
          .attr('transform', `translate(${x}, ${y})`)
          .on('end', function () { svg.call(d3Zoom().transform, d3ZoomIdentity.translate((x), (y))) })
      }, 100)
    },
    zoomInOut (scale) {
      var svg = d3Select('#baseSvg')
      var g = d3Select('#baseGroup')

      var zoom = d3Zoom()
        .scaleExtent([0.05, 2])
        .on('zoom', function () {
          g.attr('transform', d3Event.transform)
        })

      zoom.scaleBy(svg.transition().duration(150), scale)
    },
    zoomReset () {
      var svg = d3Select('#baseSvg')
      var g = d3Select('#baseGroup')

      var width = this.$refs.tree.clientWidth
      var height = this.$refs.tree.clientHeight
      g.transition()
        .duration(400)
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')scale(' + 1 + ')')
        .on('end', function () {
          svg.call(
            d3Zoom().transform,
            d3ZoomIdentity.translate((width / 2), (height / 2))
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
