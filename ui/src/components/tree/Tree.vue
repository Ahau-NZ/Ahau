<template>
  <svg id="baseSvg" width="100%" :height="height" ref="baseSvg">
    <g id="baseGroup">
      <g :transform="`translate(${treeX - radius}, ${treeY - radius})`" ref="tree" >
        <SubTree v-if="tree"
          :x="tree.x"
          :y="tree.y"
          :data="tree.data"
          :parent="tree.parent"
          :children="tree.children"
          :partners="tree.partners"
          :links="tree.links"
          :zooming="zooming"
          :scale="zoomScale"

          :showAvatars="showAvatars"
          @root-node-click="handleRootNodeClick"
          @partner-node-click="handlePartnerNodeClick"
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
      <g @click="zoomReset()" :transform="mobile ? `translate(${15} ${treeY*3})` : `translate(${30} ${treeY*3.7 - 150})`">
        <circle stroke="white" fill="white" filter="url(#shadow)" cx="20" cy="1" r="15"/>
        <circle stroke="black" fill="white" filter="url(#shadow)" cx="20" cy="1" r="5"/>
        <path d="M 20,-7 20,10 M 12,1 28,1" stroke="grey" stroke-width="1.5" />
      </g>
      <g @click="zoomInOut(1.6)" :transform="mobile ? `translate(${15} ${treeY*3.35})` : `translate(${30} ${treeY*3.7 - 60})`">
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
  zoomIdentity as d3ZoomIdentity
} from 'd3'

import SubTree from './SubTree.vue'
import settings from '@/lib/link'

export default {
  name: 'WhakapapaTree',
  props: {
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
      zooming: false,
      zoomScale: 0
    }
  },
  mounted () {
    this.componentLoaded = true
    // set loader until all the nodes have been loaded
    this.zoom()
    this.scale()
  },
  async beforeDestroy () {
    if (!this.whakapapaView) return
    if (this.whakapapaView.name === 'Loading') return
    if (!this.whakapapaView.canEdit) return

    if (!this.whakapapaView.id) {
      console.warn('Trying to save the record count without a whakapapa id', this.whakapapaView)
      return
    }

    const recordCount = await this.getRecordCount()

    if (!recordCount) return
    if (this.whakapapaView.recordCount === recordCount) return

    // if there are more records here than are recorded, update the whakapapa-view
    this.saveWhakapapaView({
      id: this.whakapapaView.id,
      recordCount
    })
  },
  computed: {
    ...mapGetters('whakapapa', ['whakapapaView']),
    ...mapGetters('tree', ['tree', 'getNode', 'getPartnerNode', 'searchedProfileId']),
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
    searchedProfileId (id) {
      if (!id) return

      const node = this.getNode(id) || this.getPartnerNode(id)
      if (!node) return

      this.centerNode(node)
      this.setSelectedProfileById(id)
    }
  },

  methods: {
    ...mapActions('person', ['setSelectedProfileById']),
    ...mapActions('whakapapa', ['saveWhakapapaView', 'toggleNodeCollapse', 'getRecordCount']),

    zoom () {
      const svg = d3Select('#baseSvg')
      const g = d3Select('#baseGroup')

      svg.call(
        d3Zoom()
          .scaleExtent([0.01, 5])
          .on('start', () => {
            this.zooming = true
          })
          .on('zoom', (event) => {
            this.zoomScale = event.transform.k
            g.attr('transform', event.transform)
          })
          .on('end', () => {
            this.zooming = false
          })
      )
        .on('dblclick.zoom', null)
    },
    scale () {
      const svg = d3Select('#baseSvg')
      const g = d3Select('#baseGroup')
      const zoom = d3Zoom()
        .on('zoom', (event) => {
          this.zoomScale = event.transform.k
          g.attr('transform', event.transform)
        })
      zoom.scaleBy(svg.transition().duration(0), 0.8)
    },

    handleRootNodeClick (id) {
      this.$emit('toggleSideDialog', id)
      // if node is not already centered, center it
      if (this.nodeCentered !== id) {
        this.setSelectedProfileById(id)
        this.centerNode(id)
        return
      }

      // if it is already centered, collapse the node
      this.toggleNodeCollapse(id)

      this.$nextTick(() => this.centerNode(id))
      // this runs the function after the DOM has been updated
    },

    handlePartnerNodeClick (id) {
      this.$emit('change-focus', id)

      setTimeout(() => this.centerNode(id), 1000)
    },

    moveTo (x, y, duration = 700) {
      const svg = d3Select('#baseSvg')

      d3Select('#baseGroup')
        .transition()
        .duration(duration)
        .attr('transform', `translate(${x}, ${y})`)
        .on('end', () => {
          svg.call(d3Zoom().transform, d3ZoomIdentity.translate(x, y))
        })
    },

    centerNode (node) {
      if (typeof node === 'string') {
        node = this.getNode(node) || this.getPartnerNode(node)
      }

      this.nodeCentered = node.data.id

      const width = this.$refs.tree.clientWidth
      const height = this.$refs.tree.clientHeight

      const x = width / 2 - node.x
      const y = height / 2 - node.y + 150

      this.moveTo(x, y)
    },

    zoomInOut (scale) {
      const svg = d3Select('#baseSvg')
      const g = d3Select('#baseGroup')

      const zoom = d3Zoom()
        .scaleExtent([0.01, 10])
        .on('zoom', (event) => g.attr('transform', event.transform))

      zoom.scaleBy(svg.transition().duration(150), scale)
    },
    zoomReset () {
      const svg = d3Select('#baseSvg')
      const g = d3Select('#baseGroup')

      const width = this.$refs.tree.clientWidth
      const height = this.$refs.tree.clientHeight
      g.transition()
        .duration(400)
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')scale(' + 1 + ')')
        .on('end', (event) => {
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
  background: linear-gradient(rgba(255, 255, 255, 0.99), rgba(255, 255, 255, 0.88)), url(@/assets/niho.svg);
  background-repeat: no-repeat;
  background-size: cover;

  height: 100%;
}

.zoomControl {
  cursor: pointer;
}

</style>
