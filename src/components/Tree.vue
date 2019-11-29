<template>
  <div id="app">
    <v-container class="body-width white mx-auto py-12 px-12">
      <v-row>
        <h1>Tree</h1>
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
                <Node :node="node" :radius="settings.nodeRadius" @click="collapse(node)" @textWidth="updateSeparation"/>
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
    <NewViewForm :show="dialog.view" @close="toggleNewView" @submit="createView($event)" />
  </div>
</template>

<script>
import * as d3 from 'd3'
import gql from 'graphql-tag'

import { VueContext } from 'vue-context'

import tree from '@/lib/tree-helpers'
import Node from './tree/Node.vue'
import Link from './tree/Link.vue'
import ViewNodeDialog from './tree/Dialogs/ViewNodeDialog.vue'
import EditNodeDialog from './tree/Dialogs/EditNodeDialog.vue'
import NewNodeDialog from './tree/Dialogs/NewNodeDialog.vue'
import NewViewForm from '@/components/whakapapa-view/New.vue'
import { concatView } from '@/lib/localStorage'

function clone (object) {
  return Object.assign({}, object)
  // NOTE - this is just a shallow clone for the moment
}

const saveWhakapapaMutation = (input) => ({
  mutation: gql`mutation ($input: WhakapapaRelationInput!) {
    saveWhakapapaRelation(input: $input)
  }`,
  variables: {
    input
  }
})

const saveWhakapapaViewQuery = gql`mutation ($input: WhakapapaViewInput) {
  saveWhakapapaView(input: $input)
}`

const whakapapaViewQuery = gql`
  query ($id: String!) {
    whakapapaView(id: $id) {
      name
      description
      focus
      mode
    }
  }
`

export default {
  props: {
    viewId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      focus: null,
      flatWhakapapa: {}, // profiles with format { %profileId: profile }
      dialog: {
        show: false,
        edit: false,
        new: false,
        view: false,
        newDetails: {},
        type: 'child'
      },
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
      contextmenu: [
        { title: 'Add Child', action: this.toggleNewChild },
        { title: 'Add Parent', action: this.toggleNewParent },
        { title: 'Edit Person', action: this.toggleEdit }
      ],
      options: {
        addnode: false
      }
    }
  },
  computed: {
    // deeply nested tree of profiles!
    nestedWhakapapa () {
      var output = this.flatWhakapapa[this.focus]
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
  async mounted () {
    await this.getView()
    await this.loadDescendants(this.focus)
    // means the vue component has rendered
    this.componentLoaded = true
    this.zoom()
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
    async getView () {
      const view = await this.$apollo.query({
        query: whakapapaViewQuery,
        variables: {
          id: this.$route.params.id
        }
      })
      this.focus = view.data.whakapapaView.focus
    },
    async loadDescendants (profileId) {
      const result = await this.getCloseWhakapapa(profileId)

      const record = result.data.closeWhakapapa
      record.children.forEach(profile => {
        this.loadDescendants(profile.id)
      })
      var output = Object.assign({}, this.flatWhakapapa)
      Object.entries(tree.flatten(record))
        .forEach(([ profileId, profile ]) => {
          // this could be a crap merge ??
          output[profileId] = Object.assign({}, output[profileId] || {}, profile)
        })
      this.flatWhakapapa = output
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
        // create a new profile
        const profileId = await this.createProfile($event)
        if (profileId) {
          switch (this.dialog.type) {
            case 'child':
              return this.createChildLink(profileId, $event)
            case 'parent':
              const newDetails = {
                profileId,
                relationDetails: $event
              }
              this.dialog.newDetails = newDetails
              return this.toggleNewView()
            default: console.log('not built')
          }
        }
      } catch (err) {
        throw err
      }
    },
    async createView ($event) {
      const input = {
        ...$event,
        focus: this.dialog.newDetails.profileId
      }
      const viewResponse = await this.$apollo.mutate({
        mutation: saveWhakapapaViewQuery,
        variables: {
          input
        }
      })
      const viewId = viewResponse.data.saveWhakapapaView
      // Temporary localStorage
      concatView({
        id: viewId,
        ...input
      })
      // link it up
      return this.createParentLink(input.focus, this.dialog.newDetails.relationDetails, viewId)
    },
    async createParentLink (profileId, { relationshipType, legallyAdopted }, view) {
      const child = this.node.selected.data.id
      const input = {
        child,
        parent: profileId,
        relationshipType,
        legallyAdopted
        // recps: [profileId]
      }
      try {
        await this.$apollo.mutate(saveWhakapapaMutation(input))
        // Change view
        console.log('Sucess! Should change route...')
        this.$router.push({ name: 'whakapapaShow', params: { id: view } })
      } catch (err) {
        throw err
      }
    },
    async createChildLink (profileId, { relationshipType, legallyAdopted }) {
      const parent = this.node.selected.data.id
      const input = {
        child: profileId,
        parent,
        relationshipType,
        legallyAdopted
        // recps: [profileId]
      }
      try {
        await this.$apollo.mutate(saveWhakapapaMutation(input))
        this.loadDescendants(this.focus)
      } catch (err) {
        throw err
      }
    },
    async createProfile ($event) {
      const createProfileReq = {
        mutation: gql`mutation ($input: CreateProfileInput!) {
          createProfile(input: $input)
        }`,
        variables: {
          input: {
            type: 'person',
            preferredName: $event.preferredName,
            legalName: $event.legalName,
            // avatarImage: ImageInput
            gender: $event.gender
          }
        }
      }
      const res = await this.$apollo.mutate(createProfileReq)
      try {
        return res.data.createProfile // a profileId
      } catch (err) {
        return err
      }
    },
    /*
      updated when the Node returns its text-width, sets the separation between nodes to the largest text width.
      Which stops overlapping labels.
    */
    updateSeparation ($event) {
      var textWidth = $event
      if (textWidth > this.settings.nodeSeparationX) {
        this.settings.nodeSeparationX = textWidth
        this.settings.nodeSeparationY = textWidth / 2
      }
    },
    collapse (node) {
      const profile = clone(this.flatWhakapapa[node.data.id])
      const { children, _children = [] } = profile

      if (children.length) {
        profile._children = children
        profile.children = []
      } else {
        profile.children = _children
        profile._children = []
      }

      this.flatWhakapapa[node.data.id] = profile
    }
  },
  components: {
    Node,
    Link,
    VueContext,
    EditNodeDialog,
    NewNodeDialog,
    ViewNodeDialog,
    NewViewForm
  }
}
</script>

<style scoped lang="scss">
  @import '~vue-context/dist/css/vue-context.css';
  h1 {
    color: black;
  }
</style>
