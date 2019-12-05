<template>
  <div id="whakapapa-tree">
    <v-container class="white px-0 py-0 mx-auto">
      <!-- TODO extract this to WhakapapaShow, it's not part of the Tree -->
        <v-container class='header px-0 py-0'>
          <v-row>
            <v-col> <h1>{{ view.name }}</h1> </v-col>
          </v-row>
          <v-row>
            <v-col class='description'> {{ view.description }} </v-col>
          </v-row>
        </v-container>

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
              <g v-for="node in nodes" :key="node.data.id" class="node">
                <Node :node="node" :radius="settings.nodeRadius"
                  @click="collapse(node)"
                  @openmenu="openContextMenu($event)"
                  @update="updateSeparation"
                />
              </g>
            </g>
          </g>
        </svg>
      </v-row>
    </v-container>

    <vue-context ref="menu">
      <li v-for="(option, index) in contextMenuOpts" :key="index">
        <a href="#" @click.prevent="option.action"> {{ option.title }} </a>
      </li>
      <li v-if="canDelete">
        <a href="#" @click.prevent="toggleDelete"> Delete Person </a>
      </li>
    </vue-context>
    <!--
      <ViewNodeDialog v-if="dialog.show" :show="dialog.show" :node="node.selected"
      @close="toggleShow"/>
      // NOTE node.selected has changed
    -->
    <EditNodeDialog v-if="dialog.edit" :show="dialog.edit"
      @close="toggleEdit"/>
    <NewNodeDialog v-if="dialog.new" :show="dialog.new"
      @close="toggleNew" @submit="addPerson($event)"/>
    <DeleteNodeDialog v-if="dialog.delete" :show="dialog.delete" :name="selectedProfile.preferredName"
      @close="toggleDelete" @submit="deleteProfile" />
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
// import ViewNodeDialog from './tree/Dialogs/ViewNodeDialog.vue'
import EditNodeDialog from './tree/Dialogs/EditNodeDialog.vue'
import NewNodeDialog from './tree/Dialogs/NewNodeDialog.vue'
import DeleteNodeDialog from './tree/Dialogs/DeleteNodeDialog.vue'

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
      myProfileId: null,
      flatWhakapapa: {}, // profiles with format { %profileId: profile }
      selectedProfile: null,
      node: {
        new: null
      },
      componentLoaded: false, // need to ensure component is loaded before using $refs

      settings: {
        nodeRadius: 50, // use variable for zoom later on
        nodeSeparationX: 100,
        nodeSeparationY: 150
      },
      dialog: {
        new: false,
        show: false,
        edit: false,
        delete: false,
        type: 'child'
      },
      contextMenuOpts: [
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
    },
    myProfileId: {
      query: gql` {
        whoami {
          profile {
            id
          }
        }
      }`,
      update (data) {
        return data.whoami.profile.id
      },
      fetchPolicy: 'no-cache'
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
    canDelete () {
      if (!this.selectedProfile) return false

      if (this.selectedProfile.id === this.myProfileId) return false
      if (this.selectedProfile.id === this.view.focus) return false

      return true
    },
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
      const result = await this.getCloseWhakapapa(profileId)
      const record = result.data.closeWhakapapa

      record.children.forEach(profile => {
        this.loadDescendants(profile.id)
      })

      var output = Object.assign({}, this.flatWhakapapa)
      Object.entries(tree.flatten(record))
        .forEach(([ profileId, profile ]) => {
          output[profileId] = Object.assign({}, output[profileId] || {}, profile)
          // this merge might be overwriting a lot
        })

      const parentIds = record.parents.map(profile => profile.id)
      parentIds.map(parentId => {
        if (!output[parentId]) return

        const currentPartners = output[parentId].partners || []
        const partners = new Set([...currentPartners, ...parentIds])
        partners.delete(parentId)
        output[parentId].partners = Array.from(partners)
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
    openContextMenu ({ $event, profileId }) {
      this.selectedProfile = this.flatWhakapapa[profileId]
      this.$refs.menu.open($event)
    },
    // toggleShow (target) {
    //   this.node.selected = target
    //   this.dialog.show = !this.dialog.show
    // },
    toggleEdit () {
      // TEMP - use the UI we have!
      this.$router.push({ name: 'personEdit', params: { id: this.selectedProfile.id } })

      // this.dialog.edit = !this.dialog.edit
    },
    toggleDelete () {
      this.dialog.delete = !this.dialog.delete
    },
    toggleNewChild () {
      this.dialog.type = 'child'
      this.toggleNew()
    },
    toggleNewParent () {
      this.dialog.type = 'parent'
      this.toggleNew()
    },
    toggleNew () {
      this.dialog.new = !this.dialog.new
    },
    async addPerson ($event) {
      try {
        const profileId = await this.createProfile($event)
        if (!profileId) return

        let child, parent
        const relationshipAttrs = pick($event, ['relationshipType', 'legallyAdopted'])
        switch (this.dialog.type) {
          case 'child':
            child = profileId
            parent = this.selectedProfile.id
            await this.createChildLink({ child, parent, ...relationshipAttrs })
            this.loadDescendants(parent)
            break
          case 'parent':
            child = this.selectedProfile.id
            parent = profileId
            const linkId = await this.createChildLink({ child, parent, ...relationshipAttrs })
            if (!linkId) return

            if (child === this.view.focus) {
              // in this case we're updating the top of the graph, we update view.focus to that new top parent
              await this.updateFocus(parent)
            } else {
              this.loadDescendants(child)
            }
            break
          default: console.log('not built')
        }
        this.dialog.new = false
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
    async deleteProfile () {
      if (!this.canDelete) return

      const res = await this.$apollo.mutate({
        mutation: gql`mutation ($input: UpdateProfileInput!) {
          updateProfile(input: $input)
        }`,
        variables: {
          input: {
            id: this.selectedProfile.id,
            tombstone: { date: new Date() }
          }
        }
      })

      if (res.errors) {
        console.error('failed to delete profile', res)
        return
      }

      this.flatWhakapapa = {}
      this.loadDescendants(this.view.focus)
      // TODO - find a smaller subset to reload!
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
    DeleteNodeDialog
    // ViewNodeDialog
  }
}
</script>

<style scoped lang="scss">
  @import '~vue-context/dist/css/vue-context.css';

  #whakapapa-tree {
    .container {
      position: relative;

      .header {
        position: absolute;
        top: 20px;
        left: 30px;

        .col {
          padding-top: 0;
          padding-bottom: 0;
        }
      }
    }
  }
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
