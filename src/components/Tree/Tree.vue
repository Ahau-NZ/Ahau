<template>
  <div id="app">
    <v-container class="body-width white mx-auto py-12 px-12">
      <v-row>
        <!--<v-btn @click="addPerson(mockNode)"> Add Child </v-btn>-->
        <svg width="100%" :height="height" ref="baseSvg">
          <g :transform="`translate(${treeX} ${treeY})`">
            <g v-for="link in links" :key="link.id" class="link">
              <Link :link="link" :branch="branch" />
            </g>
          </g>

          <g :transform="`translate(${treeX-settings.nodeRadius} ${treeY-settings.nodeRadius})`"
            ref="tree">
            <g v-for="node in nodes" :key="node.id"
              @contextmenu.prevent="openContextMenu($event, node)"
              class="node">
              <Node :node="node" :radius="settings.nodeRadius" @click="toggleShow" @textWidth="updateSeparation"/>
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

import { VueContext } from 'vue-context'

import tree from '@/lib/tree-helpers'
import Node from './Node.vue'
import Link from './Link.vue'
import ViewNodeDialog from './Dialogs/ViewNodeDialog.vue'
import EditNodeDialog from './Dialogs/EditNodeDialog.vue'
import NewNodeDialog from './Dialogs/NewNodeDialog.vue'

export default {
  props: {
    viewId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      focus: null, // ? be in props later?
      flatWhakapapa: {}, // profiles with format { %profileId: profile }

      dialog: {
        show: false,
        edit: false,
        new: false,
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
  apollo: {
    // TEMP - just using until we connect whakapapa/views
    focus: {
      query: gql` {
        whoami {
          profile { id }
        }
      }`,
      update: data => data.whoami.profile.id,
      fetchPolicy: 'no-cache'
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
  watch: {
    // TEMP ? till we connect whakapapa/views
    focus (newProfileId) {
      this.loadDescendants(newProfileId)
    }
  },
  mounted () {
    // means the vue component has rendered
    this.componentLoaded = true
  },
  methods: {
    async loadDescendants (profileId) {
      const result = await this.getCloseWhakapapa(profileId)

      const record = result.data.whakapapa
      record.children.forEach(profile => {
        this.loadDescendants(profile.id)
      })

      var output = Object.assign({}, this.flatWhakapapa)
      Object.entries(tree.flatten(record))
        .forEach(([ profileId, profile ]) => {
          // this could be a crap merge ):
          console.log('dip', output[profileId], profile)
          output[profileId] = Object.assign({}, output[profileId] || {}, profile)
        })

      this.flatWhakapapa = output
    },
    async getCloseWhakapapa (profileId) {
      const request = {
        query: gql`query ($id: String) {
          whakapapa(id: $id) {
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

      const result = await this.$apollo.query(request)
      if (!result.data) {
        console.error('WARNING, something went wrong')
        console.error(result)
        return
      }
      return result
    },
    toggleShow (target) {
      this.node.selected = target
      this.dialog.show = !this.dialog.show
    },
    toggleEdit () {
      this.dialog.edit = !this.dialog.edit
    },
    closeNew () {
      this.dialog.new = false
    },
    toggleNewChild (state = false) {
      this.dialog.type = 'child'
      this.dialog.new = true
    },

    toggleNewParent (state = false) {
      this.dialog.type = 'parent'
      this.dialog.new = true
    },

    openContextMenu ($event, node) {
      this.node.selected = node
      this.$refs.menu.open($event)
    },
    /*
      adds a new child node onto the selected node
      TODO: Fix memory leak with NewNodeDialog and Tree
    */
    async addPerson ($event) {
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
      const isChild = this.dialog.type === 'child'

      const saveWhakapapaReq = {
        mutation: gql`mutation ($input: WhakapapaRelationInput!) {
          saveWhakapapaRelation(input: $input)
        }`,
        variables: {
          input: {
            child: isChild ? res.data.createProfile : this.node.selected.data.id,
            parent: isChild ? this.node.selected.data.id : res.data.createProfile,
            relationshipType: $event.relationshipType,
            legallyAdopted: $event.legallyAdopted
          }
        }
      }
      const whakapapaResponse = await this.$apollo.mutate(saveWhakapapaReq)
      console.log('Created new Whakapapa relation: ', whakapapaResponse.data.saveWhakapapaRelation)

      // TODO this is not reactive - i.e. we should not be doing this newNode manipulation here

      var selected = this.node.selected
      var newNode = d3.hierarchy($event)

      newNode.depth = isChild ? selected.depth + 1 : selected.depth - 1
      newNode.height = isChild ? selected.height - 1 : selected.height + 1
      if (isChild) newNode.parent = selected
      else newNode.child = selected

      if (selected.children === undefined) {
        selected.children = []
        selected.data.children = []
      }
      if (selected.parents === undefined) {
        selected.parents = []
        selected.data.parents = []
      }
      if (isChild) {
        selected.children.push(newNode)
        selected.data.children.push(newNode.data)
      } else {
        selected.parents.push(newNode)
        selected.data.parents.push(newNode.data)
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
    }
  },
  components: {
    Node,
    Link,
    VueContext,
    ViewNodeDialog,
    EditNodeDialog,
    NewNodeDialog
  }
}
</script>

<style scoped lang="scss">
  @import '~vue-context/dist/css/vue-context.css';
  h1 {
    color: black;
  }
</style>
