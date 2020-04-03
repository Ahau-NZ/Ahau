<template>
  <div id="whakapapa-show">
    <v-container class="white px-0 py-0 mx-auto">

      <!-- Desktop Header -->
      <v-row v-if="!mobile" class="header">
        <WhakapapaViewCard :view="whakapapaView" :shadow="false">
          <v-row class="lock-container pl-3">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" small color="#555">mdi-lock</v-icon>
              </template>
              <span>Private record - Only visible by you</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  @click.prevent="dialog.active = 'whakapapa-edit'"
                  align="right"
                  color="white"
                  text
                  x-small
                  class="blue--text edit pl-8"
                >
                  <v-icon small class="blue--text" left>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit whakapapa description</span>
            </v-tooltip>
          </v-row>
        </WhakapapaViewCard>
      </v-row>

        <!-- Whakapapa Title Card -->  
        <!-- <v-row v-if="!mobile" class="header""> -->
        <!-- Whakapapa"SHOW"ViewCard -->
        <!-- <WhakapapaShowViewCard :view="whakapapaView" :shadow="false">
          <template v-slot:edit>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click.prevent="dialog.active = 'whakapapa-edit'" 
                    icon
                    class="pa-0 px-3"
                  >
                    <v-icon small class="blue--text">mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit whakapapa description</span>
              </v-tooltip>
            </template>
        </WhakapapaShowViewCard> -->

        <!-- <WhakapapaViewCard :view="whakapapaView" :shadow="false">
            <v-row class="lock-container pl-3">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" small color="#555">mdi-lock</v-icon>
                </template>
                <span>Private record - Only visible by you</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click.prevent="dialog.active = 'whakapapa-edit'"
                    align="right"
                    color="white"
                    text
                    x-small
                    class="blue--text edit pl-8"
                  >
                    <v-icon small class="blue--text" left>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit whakapapa description</span>
              </v-tooltip>
            </v-row>
          </WhakapapaViewCard> -->

      

      <!-- Mobile Header -->
      <WhakapapaBanner
        v-if="mobile"
        :view="whakapapaView"
        @edit="updateDialog('whakapapa-edit', null)"
        @more-info="updateDialog('whakapapa-view', null)"
      />

      <v-row v-if="!mobile" class="select">

        <div v-if="search" class="icon-search">
          <SearchBar :nestedWhakapapa="nestedWhakapapa" :searchNodeId.sync="searchNodeId" @close="clickedOff()"/>
        </div>

        <div v-else  class="icon-button">
          <SearchButton :search.sync="search"/>
        </div>

        <div v-if="whakapapa.table && flatten" class="icon-button">
          <FilterButton :filter="filter" @filter="toggleFilter()" />
        </div>
        <div v-if="whakapapa.table" class="icon-button">
          <FlattenButton @flatten="toggleFlatten()" />
        </div>
        <div class="icon-button">
          <TableButton @table="toggleTable()" />
        </div>
        <div class="icon-button">
          <HelpButton v-if="whakapapa.tree" @click="updateDialog('whakapapa-helper', null)" />
          <HelpButton v-else @click="updateDialog('whakapapa-table-helper', null)" />
        </div>
        <div class="icon-button">
          <FeedbackButton />
        </div>
      </v-row>

      <v-row>
        <Tree
          v-if="whakapapa.tree"
          :view="whakapapaView"
          :currentFocus="currentFocus"
          :getRelatives="getRelatives"
          :nestedWhakapapa="nestedWhakapapa"
          :relationshipLinks="relationshipLinks"
          @load-descendants="loadDescendants($event)"
          @collapse-node="collapseNode($event)"
          @open-context-menu="openContextMenu($event)"
          :searchNodeId="searchNodeId"
          @change-focus="changeFocus($event)"
        />
        <Table
          v-if="whakapapa.table"
          :filter="filter"
          :flatten="flatten"
          :view="whakapapaView"
          :nestedWhakapapa="nestedWhakapapa"
          :relationshipLinks="relationshipLinks"
          @load-descendants="loadDescendants($event)"
          @collapse-node="collapseNode($event)"
          @open-context-menu="openContextMenu($event)"
          :searchNodeId="searchNodeId"
        />
      </v-row>
    </v-container>

    <vue-context ref="menu" class="px-0"  >
      <li v-for="(option, index) in contextMenuOpts" :key="index">
        <a href="#" @click.prevent="updateDialog(option.dialog, option.type)" class="d-flex align-center px-4">
          <img class="contextMenuIcon" :src="option.icon"/>
          <p class="ma-0 pl-3">{{ option.title }}</p>
        </a>
      </li>
      <li v-if="canDelete(selectedProfile)">
        <a href="#" @click.prevent="updateDialog('delete-node', null)" class="d-flex align-center px-4">
          <v-icon class="contextMenuIcon">mdi-delete</v-icon>
          <p class="ma-0 pl-3">Delete Person</p>
        </a>
      </li>
    </vue-context>
    <DialogHandler
      :dialog.sync="dialog.active"
      :type.sync="dialog.type"
      :selectedProfile="selectedProfile"
      :view="whakapapaView"
      @load="loadDescendants($event)"
      @updateFocus="updateFocus($event)"
      @set="setSelectedProfile($event)"
      @change-focus="changeFocus($event)"
      @newAncestor="showNewAncestors($event)"
      :nestedWhakapapa="nestedWhakapapa"
      :profiles.sync="profiles"
      @updateWhakapapa="updateWhakapapa($event)"
      @deleteWhakapapa="deleteWhakapapa"
      @refreshWhakapapa="refreshWhakapapa"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import isEmpty from 'lodash.isempty'
import { VueContext } from 'vue-context'

import WhakapapaViewCard from '@/components/whakapapa-view/WhakapapaViewCard.vue'
import WhakapapaShowViewCard from '@/components/whakapapa-view/WhakapapaShowViewCard.vue'
import WhakapapaBanner from '@/components/whakapapa-view/WhakapapaBanner.vue'

import Tree from '@/components/Tree.vue'
import Table from '@/components/Table.vue'
import FeedbackButton from '@/components/button/FeedbackButton.vue'
import TableButton from '@/components/button/TableButton.vue'
import HelpButton from '@/components/button/HelpButton.vue'
import FlattenButton from '@/components/button/FlattenButton.vue'
import FilterButton from '@/components/button/FilterButton.vue'

import SearchBar from '@/components/button/SearchBar.vue'
import SearchButton from '@/components/button/SearchButton.vue'

import tree from '@/lib/tree-helpers'
import avatarHelper from '@/lib/avatar-helpers.js'

import DialogHandler from '@/components/dialog/DialogHandler.vue'
import findSuccessor from '@/lib/find-successor'

const saveWhakapapaViewMutation = input => (
  {
    mutation: gql`
    mutation($input: WhakapapaViewInput) {
      saveWhakapapaView(input: $input)
    }
  `,
    variables: { input }
  })

export default {
  name: 'WhakapapaShow',
  components: {
    WhakapapaViewCard,
    WhakapapaShowViewCard,
    TableButton,
    HelpButton,
    FlattenButton,
    FilterButton,
    SearchBar,
    SearchButton,
    FeedbackButton,
    Table,
    Tree,
    VueContext,
    DialogHandler,
    WhakapapaBanner
  },
  data () {
    return {
      search: false,
      searchNodeId: '',
      showWhakapapaHelper: false,
      whakapapaView: {
        name: 'Loading',
        description: '',
        focus: '',
        // mode: 'descendants',
        recps: null,
        image: { uri: '' },
        ignoredProfiles: []
      },
      focus: null,
      // the record which defines the starting point for a tree (the 'focus')
      whoami: {
        profile: { id: '' }
      },
      // my profile id, to ensure we don't delete our own profile

      profiles: {},

      // a dictionary which maps profileIds > profiles
      // this is a store for lookups, and from which we build up nestedWhakapapa

      relationshipLinks: [], // shows relationship information between two profiles -> reference using parentId-childId as the key

      recordQueue: [],
      processingQueue: false,

      suggestions: [], // holds an array of suggested profiles
      selectedProfile: null,
      dialog: {
        active: null,
        type: null
      },
      filter: false,
      flatten: false,
      whakapapa: {
        tree: true,
        table: false
      },
      contextMenuOpts: [
        { title: 'View Person', dialog: 'view-edit-node', icon: require('../assets/account-circle.svg')},
        { title: 'Add Parent', dialog: 'new-node', type: 'parent', icon: require('../assets/node-parent.svg')},
        { title: 'Add Child', dialog: 'new-node', type: 'child', icon: require('../assets/node-child.svg')}
      ]
    }
  },
  apollo: {
    whakapapaView () {
      return {
        query: gql`
          query($id: String!) {
            whakapapaView(id: $id) {
              name
              description
              image {
                uri
              }
              focus
              recps
              ignoredProfiles
            }
          }
        `,
        variables: { id: this.$route.params.id },
        fetchPolicy: 'no-cache'
      }
    },
    whoami: {
      query: gql`
        {
          whoami {
            profile {
              id
            }
          }
        }
      `,
      fetchPolicy: 'no-cache'
    }
  },
  computed: {

    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    currentFocus: {
      get: function () {
      // the current focused profile of the whakapapa tree
        if (!this.focus) return this.whakapapaView.focus
        return this.focus
      },
      set: function (newValue) {
        this.focus = newValue
      }
    },
    nestedWhakapapa () {
      var startingProfile = this.profiles[this.currentFocus]
      if (!startingProfile) {
        return {
          preferredName: 'Loading',
          gender: 'unknown',
          children: [],
          parents: []
        }
      }

      return tree.hydrate(startingProfile, this.profiles)
    }
  },
  watch: {
    'currentFocus': async function (newFocus) {
      if (newFocus) {
        await this.loadDescendants(newFocus)
      }
    },
    processingQueue: function (isProcessing) {
      if (!isProcessing) return

      while (this.recordQueue.length) {
        const record = this.recordQueue.shift()

        var output = Object.assign({}, this.profiles)

        // flatten out record and merge into current profiles
        Object.entries(tree.flatten(record)).forEach(([profileId, profile]) => {
          output[profileId] = Object.assign(
            { partners: [] }, // NOTE - ensures all nodes have "partners" field
            output[profileId] || {},
            profile
          )
          // this merge might be overwriting a lot
        })

        // populate the "partners" field of each parent
        const parentIds = record.parents.map(link => link.profile.id)
        parentIds.forEach(parentId => {
          if (!output[parentId]) return

          const currentPartners = output[parentId].partners || []
          const partners = new Set([...currentPartners, ...parentIds])
          partners.delete(parentId)
          output[parentId].partners = Array.from(partners)
        })

        this.profiles = Object.assign({}, this.profiles, output)
      }

      this.processingQueue = false
    }
  },
  methods: {
    clickedOff () {
      this.search = !this.search
    },
    // when adding a partner ancestor update the tree to load
    showNewAncestors (parent) {
      this.currentFocus = parent
    },
    isVisibleProfile (descendant) {
      return this.whakapapaView.ignoredProfiles.indexOf(descendant.profile.id) === -1
    },
    canDelete (profile) {
      if (!profile) return false

      // not allowed to delete own profile
      if (profile.id === this.whoami.profile.id) return false

      // if deleting the focus (top ancestor)
      if (profile.id === this.whakapapaView.focus) {
        // can only proceed if can find a clear "successor" to be new focus
        return Boolean(findSuccessor(profile))
      }

      return true
    },
    updateDialog (dialog, type) {
      this.dialog.type = type
      this.dialog.active = dialog
    },
    async changeFocus (profileId) {
      const newFocus = await this.getWhakapapaHead(profileId, 'newAmountParents')
      this.currentFocus = newFocus
    },
    async getWhakapapaHead (profileId, type = 'temp') {
      const record = await this.getRelatives(profileId)
      if (!record || !record.parents || record.parents.length < 1) return profileId
      // this.partnerFocus[type] = this.partnerFocus[type] + 1
      for await (const parent of record.parents) {
        // follow parent from the main branch
        if (this.profiles[parent.profile.id] && this.profiles[parent.profile.id].parents) {
          return this.getWhakapapaHead(parent.profile.id, type)
        }
      }
      return this.getWhakapapaHead(record.parents[0].profile.id, type)
    },

    async getRelatives (profileId) {
      const request = {
        query: gql`
          query($id: String!) {
            person(id: $id) {
              id
              preferredName
              legalName
              gender
              bornAt
              diedAt
              birthOrder
              description
              contact
              location
              profession
              altNames
              avatarImage {
                uri
              }
              children {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  bornAt
                  diedAt
                  birthOrder
                  description
                  contact
                  location
                  profession
                  altNames
                  avatarImage {
                    uri
                  }
                }
                relationshipId
                relationshipType
              }

              parents {
                profile {
                  id
                  preferredName
                  legalName
                  gender
                  bornAt
                  diedAt
                  birthOrder
                  description
                  contact
                  location
                  profession
                  altNames
                  avatarImage {
                    uri
                  }
                }
                relationshipId
                relationshipType
              }
            }
          }
        `,
        variables: {
          id: profileId
        },
        fetchPolicy: 'no-cache'
      }

      try {
        const result = await this.$apollo.query(request)
        if (result.errors) {
          console.error('WARNING, something went wrong')
          console.error(result.errors)
          return
        }
        return result.data.person
      } catch (e) {
        console.error('WARNING, something went wrong, caught it')
        console.error(e)
      }
    },
    async loadDescendants (profileId) {
      // fetch close whakapapa records for this profile
      const record = await this.getRelatives(profileId)
      if (!record) return

      // if (whakapapaView.mode === 'descendants')

      // filter ignored profiles
      record.children = record.children.filter(this.isVisibleProfile)
      record.parents = record.parents.filter(this.isVisibleProfile)

      // follow the child-links and load the next generation
      record.children.forEach(child => {
        // get their ids
        var info = {
          relationshipId: child.relationshipId,
          relationshipType: child.relationshipType,
          parent: record.id,
          child: child.profile.id
        }
        this.relationshipLinks[record.id + '-' + child.profile.id] = info // puts a link into links which can be referenced using parentId-childId

        this.loadDescendants(child.profile.id)
      })

      // add this to queue of records to process and merge into graph
      // so that we don't get collisions / overwrites
      this.recordQueue = [...this.recordQueue, record]
      if (!this.processingQueue) this.processingQueue = true
    },
    collapseNode (profileId) {
      const profile = this.profiles[profileId]
      const { children, _children = [] } = profile

      if (children.length === 0 && _children.length === 0) return

      this.profiles[profileId] = Object.assign(profile, {
        isCollapsed: !profile.isCollapsed,
        _children: children,
        children: _children
      })
    },
    // contextMenu //////////////////////////
    // TODO - extract all this
    openContextMenu ({ event, profileId }) {
      if (this.dialog.view) {
        this.toggleView()
      }
      this.setSelectedProfile(profileId)
      this.$refs.menu.open(event)
    },
    toggleFilter () {
      this.filter = !this.filter
    },
    toggleFlatten () {
      this.filter = false
      this.flatten = !this.flatten
    },
    toggleTable () {
      this.whakapapa.tree = !this.whakapapa.tree
      this.whakapapa.table = !this.whakapapa.table
    },
    toggleWhakapapaHelper () {
      this.showWhakapapaHelper = !this.showWhakapapaHelper
    },
    async updateFocus (focus) {
      const input = {
        id: this.$route.params.id,
        focus
      }
      try {
        const res = await this.$apollo.mutate(saveWhakapapaViewMutation(input))
        if (res.data) this.currentFocus = focus
        else console.error(res)
      } catch (err) {
        throw err
      }
    },
    async setSelectedProfile (profileId) {
      await this.loadDescendants(profileId)
      this.selectedProfile = tree.hydrate(
        this.profiles[profileId],
        this.profiles
      )

      if (!this.selectedProfile.parents || this.selectedProfile.parents.length === 0) return
      var mainParent = this.selectedProfile.parents[0]
      this.selectedProfile.relationship = this.relationshipLinks[mainParent.id + '-' + this.selectedProfile.id]
    },

    // save whakapapa changes
    async updateWhakapapa (whakapapaChanges) {
      const input = {
        id: this.$route.params.id
      }
      Object.entries(whakapapaChanges).forEach(([key, value]) => {
        if (!isEmpty(value)) input[key] = value
      })
      try {
        const res = await this.$apollo.mutate(saveWhakapapaViewMutation(input))
        // If saving changes works than set the new whakapapa information
        // TODO: res has new whakapapa record information so we dont need to query it here
        if (res.data) {
          const updatedWhakapapa = await this.$apollo.query({
            query: gql`
              query($id: String!) {
                whakapapaView(id: $id) {
                  name
                  description
                  image { uri }
                  focus
                  recps
                }
              }
            `,
            variables: { id: res.data.saveWhakapapaView },
            fetchPolicy: 'no-cache'
          })
          // update the whakapapaView with new record
          if (updatedWhakapapa.data) {
            this.whakapapaView = updatedWhakapapa.data.whakapapaView
          }
        } else console.error(res)
      } catch (err) {
        throw err
      }
    },
    async refreshWhakapapa () {
      this.profiles = {}
      await this.$apollo.queries.whakapapaView.refresh()
      await this.loadDescendants(this.whakapapaView.focus)
    },
    async deleteWhakapapa () {
      const treeResult = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: WhakapapaViewInput) {
            saveWhakapapaView(input: $input)
          }
        `,
        variables: {
          input: {
            id: this.$route.params.id,
            tombstone: { date: new Date() }
          }
        }
      })

      if (treeResult.errors) {
        console.error('failed to delete tree', treeResult)
        return
      }
      this.$router.push({ name: 'whakapapaIndex', params: { id: this.whakapapaView.recps } })
    },
    getImage () {
      return avatarHelper.defaultImage(this.bornAt, this.gender)
    }
  }
}
</script>

<style>
  .v-select.v-select--is-menu-active
  .v-input__icon--append
  .v-icon {
    transform: rotate(0);
  }

</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~vue-context/dist/css/vue-context.css";

#whakapapa-show {
  & > .container {
    position: relative;
    & > .header {
      position: absolute;
      top: 20px;
      left: 30px;
      // left: 30px;
      right: 160px;
      width: 30%;

      .col {
        padding-top: 0;
        padding-bottom: 0;
      }
    }

    & > .select {
      position: absolute;
      top: 20px;
      right: 50px;

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
.fixed {
  position: fixed;
}

.icon-button {
  padding: 0px;
  width: 50px;
  display: flex;
  justify-content: flex-end;
}

.icon-search {
  width: 300px;
  display: flex;
  justify-items: flex-end;
}

.contextMenuIcon {
  width: 20px;
  height: 20px;
  color: black;
}

</style>
