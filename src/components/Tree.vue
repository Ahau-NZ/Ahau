<template>
  <div id="whakapapa-tree">
    <v-container class="white mx-auto py-12 px-12">
      <v-row>
        <h1>{{ view.name }}</h1>
      </v-row>
      <v-row>
        <div class='description'>{{ view.description }}</div>
      </v-row>
      <v-row>
        <svg id="baseSvg" width="100%" :height="height" ref="baseSvg">
          <g id="baseGroup">
            <g :transform="`translate(${treeX} ${treeY})`">
              <g v-for="link in links" :key="link.id" class="link">
                <Link :link="link" :branch="branch" />
              </g>
            </g>

            <g :transform="`translate(${treeX-settings.nodeRadius} ${treeY-settings.nodeRadius})`"
              ref="tree">
              <g v-for="node in nodes" :key="node.data.id"
                @contextmenu.prevent="openContextMenu($event, node)"
                class="node">
                <Node :node="node" :radius="settings.nodeRadius" @click="collapse(node)" @update="updateSeparation" :main="true"/>
              </g>
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
      <ViewNodeDialog v-if="dialog.show" :show="dialog.show" :node="node.selected"
        @close="toggleShow"/>
    <EditNodeDialog v-if="dialog.edit" :show="dialog.edit"
      @close="toggleEdit"/>
    <NewNodeDialog v-if="dialog.new" :show="dialog.new"
      @close="closeNew" @submit="addPerson($event)"/>
  </div>
</template>

<script>
import * as d3 from 'd3'
import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { VueContext } from 'vue-context'

import tree from '@/lib/tree-helpers'
import Node from './tree/Node.vue'
import Link from './tree/Link.vue'
import ViewNodeDialog from './tree/Dialogs/ViewNodeDialog.vue'
import EditNodeDialog from './tree/Dialogs/EditNodeDialog.vue'
import NewNodeDialog from './tree/Dialogs/NewNodeDialog.vue'

const saveWhakapapaRelMutation = (input) => ({
  mutation: gql`mutation ($input: WhakapapaRelationInput!) {
    saveWhakapapaRelation(input: $input)
  }`,
  variables: { input }
})

const saveWhakapapaViewMutation = (input) => ({
  mutation: gql`mutation ($input: WhakapapaViewInput) {
    saveWhakapapaView(input: $input)
  }`,
  variables: { input }
})

export default {
  props: {
    viewId: { type: String, required: true }
  },
  data () {
    return {
      view: {
        name: null,
        description: null,
        focus: null,
        recps: null
      },
      flatWhakapapa: {}, // profiles with format { %profileId: profile }
      node: {
        selected: null,
        new: null
      },
      componentLoaded: false, // need to ensure component is loaded before using $refs

      settings: {
        nodeRadius: 50, // use variable for zoom later on
        nodeSeparationX: 100,
        nodeSeparationY: 150
      },
      dialog: {
        show: false,
        edit: false,
        new: false,
        view: false,
        newDetails: {},
        type: 'child'
      },
      contextmenu: [
        { title: 'Add Child', action: this.toggleNewChild },
        { title: 'Add Parent', action: this.toggleNewParent },
        { title: 'Edit Person', action: this.toggleEdit }
      ],
      options: {
        addnode: false // Is this used by anything?
      }
    }
  },
  apollo: {
    view () {
      return {
        query: gql` query ($id: String!) {
          whakapapaView(id: $id) {
            name
            description
            focus
            mode
            recps
          }
        }`,
        variables: { id: this.viewId },
        update: data => data.whakapapaView,
        fetchPolicy: 'no-cache'
      }
    }
  },
  watch: {
    'view.focus': async function (newFocus) {
      this.loadDescendants(newFocus)
    }
  },
  mounted () {
    this.componentLoaded = true
    this.zoom()
  },
  computed: {
    // deeply nested tree of profiles!
    nestedWhakapapa () {
      var output = this.flatWhakapapa[this.view.focus]
      if (!output) {
        return {
          preferredName: 'Loading',
          gender: 'unknown',
          children: [],
          parents: []
        }
      }

      return tree.hydrate(output, this.flatWhakapapa)
    },
    branch () {
      return this.settings.nodeSeparationY / 2 + this.settings.nodeRadius
    },
    /*
      the space between nodes on the x axis
      @TODO: will be used later on for implementing zoom and pan on tree
    */
    nodeSeparationX () {
      return this.settings.nodeSeparationX
    },
    /*
      the space between node on the y axis
      @TODO: will be used later on for implementing zoom and pan on tree
    */
    nodeSeparationY () {
      return this.settings.nodeSeparationY
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
          this.nodeSeparationX + this.settings.nodeRadius,
          this.nodeSeparationY + this.settings.nodeRadius
        ])
        .separation(function (a, b) {
          return a.parent === b.parent ? 1 : 2
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
    zoom () {
      var svg = d3.select('#baseSvg')
      var g = d3.select('#baseGroup')
      svg.call(
        d3.zoom().on('zoom', function () {
          g.attr('transform', d3.event.transform)
        }))
    },
    async loadDescendants (profileId) {
      let unique = []
      let partners = []
      const record = await this.loadProfile(profileId)
      unique[profileId] = true
      record.children.forEach(async profile => {
        this.loadDescendants(profile.id)

        const childProfile = await this.loadProfile(profile.id)
        childProfile.parents.forEach(async profileId => {
          if (!unique[profileId]) {
            unique[profileId] = true
            const parentProfile = await this.loadProfile(profileId)
            partners.push(parentProfile)
          }
        })
      })
      record.partners = partners

      var output = Object.assign({}, this.flatWhakapapa)
      Object.entries(tree.flatten(record))
        .forEach(([ profileId, profile ]) => {
          // this could be a crap merge ??
          output[profileId] = Object.assign({}, output[profileId] || {}, profile)
        })
      this.flatWhakapapa = output
    },
    async loadProfile (profileId) {
      const result = await this.getCloseWhakapapa(profileId)
      const record = result.data.closeWhakapapa
      return record
    },
    async getCloseWhakapapa (profileId) {
      const request = {
        query: gql`query ($id: String) {
          closeWhakapapa(id: $id) {
            id
            gender
            preferredName
            avatarImage {
              uri
            }
            children {
              id
              gender
              preferredName
              avatarImage {
                uri
              }
            }
            parents {
              id
              gender
              preferredName
              avatarImage {
                uri
              }
            }
          }
        }`,
        variables: {
          id: profileId
        },
        fetchPolicy: 'no-cache'
      }

      try {
        const result = await this.$apollo.query(request)
        return result
      } catch (err) {
        console.error('WARNING, something went wrong')
        console.error(err)
        return err
      }
    },
    toggleShow (target) {
      this.node.selected = target
      this.dialog.show = !this.dialog.show
    },
    toggleEdit () {
      // TEMP - use the UI we have!
      this.$router.push({ name: 'personEdit', params: { id: this.node.selected.data.id } })

      // this.dialog.edit = !this.dialog.edit
    },
    closeNew () {
      this.dialog.new = false
    },
    toggleNewChild () {
      this.dialog.type = 'child'
      this.dialog.new = !this.dialog.new
    },
    toggleNewParent () {
      this.dialog.type = 'parent'
      this.dialog.new = !this.dialog.new
    },
    toggleNewView () {
      this.dialog.view = !this.dialog.view
    },

    openContextMenu ($event, node) {
      this.node.selected = node
      this.$refs.menu.open($event)
    },
    /*
      TODO: Fix memory leak with NewNodeDialog and Tree
    */
    async addPerson ($event) {
      try {
        const profileId = await this.createProfile($event)
        if (!profileId) return

        let child, parent
        const relationshipAttrs = pick($event, ['relationshipType', 'legallyAdopted'])
        switch (this.dialog.type) {
          case 'child':
            child = profileId
            parent = this.node.selected.data.id
            await this.createChildLink({ child, parent, ...relationshipAttrs })
            this.loadDescendants(parent)
            break
          case 'parent':
            child = this.node.selected.data.id
            parent = profileId
            const linkId = await this.createChildLink({ child, parent, ...relationshipAttrs })
            if (!linkId) return

            if (child === this.view.focus) {
              // in this case we're updating the top of the graph, we update view.focus to that new top parent
              await this.updateFocus(parent)
            }
            break
          default: console.log('not built')
        }
        this.toggleNewView()
      } catch (err) {
        throw err
      }
    },
    async createProfile ({ preferredName, legalName, gender }) {
      const res = await this.$apollo.mutate({
        mutation: gql`mutation ($input: CreateProfileInput!) {
          createProfile(input: $input)
        }`,
        variables: {
          input: {
            type: 'person',
            preferredName,
            legalName,
            gender,
            recps: this.view.recps
            // avatarImage: ImageInput
          }
        }
      })

      if (res.errors) {
        console.error('failed to createProfile', res)
        return
      }
      return res.data.createProfile // a profileId
    },
    async createChildLink ({ child, parent, relationshipType, legallyAdopted }, view) {
      const input = {
        child,
        parent,
        relationshipType,
        legallyAdopted,
        recps: this.view.recps
      }
      try {
        const res = await this.$apollo.mutate(saveWhakapapaRelMutation(input))
        if (res.errors) {
          console.error('failed to createChildLink', res)
          return
        }
        return res // TODO return the linkId
      } catch (err) {
        throw err
      }
    },
    async updateFocus (focus) {
      const input = {
        viewId: this.viewId,
        focus
      }
      try {
        const res = await this.$apollo.mutate(saveWhakapapaViewMutation(input))
        if (res.data) this.view.focus = focus
        else console.error(res)
      } catch (err) {
        throw err
      }
    },
    /*
      updated when the Node returns its text-width, sets the separation between nodes to the largest text width.
      Which stops overlapping labels.
    */
    updateSeparation ($event) {
      var width = $event
      if (width > this.settings.nodeSeparationX) {
        this.settings.nodeSeparationX = width
      }
    },
    collapse (node) {
      const profile = this.flatWhakapapa[node.data.id]
      const { children, _children = [] } = profile

      if (children.length === 0 && _children.length === 0) return

      this.flatWhakapapa[node.data.id] = Object.assign(profile, {
        isCollapsed: !profile.isCollapsed,
        _children: children,
        children: _children
      })
    }
  },
  components: {
    Node,
    Link,
    VueContext,
    EditNodeDialog,
    NewNodeDialog,
    ViewNodeDialog
  }
}
</script>

<style scoped lang="scss">
  @import '~vue-context/dist/css/vue-context.css';
  h1 {
    color: black;
  }
  .description {
    color: #555;
  }
  svg#baseSvg {
    cursor: grab;
  }
</style>
