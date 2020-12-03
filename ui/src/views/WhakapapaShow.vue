<template>
  <div id="whakapapa-show">
    <v-container fluid class="pa-0" :style="[ mobile ? 'width:100vw' : 'width:95vw; margin-top:64px;' ]">

      <!-- Desktop Header -->
      <!-- Whakapapa Title Card -->
      <v-row v-if="!mobile" class="header">
        <!-- Whakapapa"SHOW"ViewCard -->
        <WhakapapaShowViewCard :view="whakapapaView" :access="access" :shadow="false">
          <template v-slot:edit v-if="whakapapaView && whakapapaView.canEdit">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  @click.stop="dialog.active = 'whakapapa-edit'"
                  icon
                  class="pa-0 px-3"
                >
                  <v-icon small class="blue--text">mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit whakapapa description</span>
            </v-tooltip>
          </template>
        </WhakapapaShowViewCard>
      </v-row>

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

      <!-- speed dial menu for mobile -->
      <v-card v-if="mobile" id="create">
        <v-speed-dial
          v-model="fab"
          top
          left
          direction="right"
          transition="slide-y-transition"
        >
          <template v-slot:activator>
            <v-btn
              v-model="fab"
              color="black"
              dark
              fab
              x-small
            >
              <v-icon v-if="fab">mdi-close</v-icon>
              <v-icon v-else>mdi-hexagon-multiple</v-icon>
            </v-btn>
          </template>
          <div v-if="search" class="icon-search ml-n12 pt-7" @click.stop>
            <SearchBar :nestedWhakapapa="nestedWhakapapa" :searchNodeId.sync="searchNodeId" @close="clickedOff()"/>
          </div>
          <div v-else  class="icon-button">
            <SearchButton  @click.stop :search.sync="search"/>
          </div>
          <div v-if="whakapapa.table && flatten" class="icon-button">
            <FilterButton :filter="filter" @filter="toggleFilter()" />
          </div>
          <div v-if="whakapapa.table" class="icon-button">
            <FlattenButton @flatten="toggleFlatten()" />
          </div>
          <!-- <div class="icon-button">
            <TableButton @table="toggleTable()" />
          </div> -->
          <div class="icon-button">
            <HelpButton v-if="whakapapa.tree" @click="updateDialog('whakapapa-helper', null)" />
            <HelpButton v-else @click="updateDialog('whakapapa-table-helper', null)" />
          </div>
          <div class="icon-button">
            <FeedbackButton />
          </div>
        </v-speed-dial>
      </v-card>

      <v-row v-if="whakapapa.table && overflow" :class="mobile ? 'navigateMobile' : 'navigate'">
        <div class="icon-button">
          <v-btn fab x-small light @click="togglePan(200)">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </div>
        <div class="icon-button">
          <v-btn fab x-small light @click.stop="togglePan(-200)">
            <v-icon>mdi-sort</v-icon>
          </v-btn>
        </div>
      </v-row>

      <Tree
        :class="mobile? 'mobile-tree':'tree'"
        v-if="whakapapa.tree"
        :getRelatives="getRelatives"
        @load-descendants="loadDescendants($event)"
        @collapse-node="collapseNode($event)"
        @open-context-menu="openContextMenu($event)"
        @change-focus="changeFocus($event)"
        @loading='load($event)'
        :view="whakapapaView"
        :focus="focus"
        :searchNodeId="searchNodeId"
      />
      <div class="whakapapa-table">
        <Table
          v-if="whakapapa.table"
          ref="table"
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
      </div>
    </v-container>

    <vue-context ref="menu" class="px-0">
      <li>
        <a href="#" @click.prevent="updateDialog('view-edit-node', null)"  class="d-flex align-center px-4">
          <img class="contextMenuIcon" :src="require('../assets/account-circle.svg')"/>
          <p class="ma-0 pl-3">View Person</p>
        </a>
      </li>
      <li v-for="(option, index) in contextMenuOpts" :key="index">
        <a v-if="option.isPermitted" href="#" @click.prevent="updateDialog(option.dialog, option.type)" class="d-flex align-center px-4">
          <v-icon v-if="option.icon==='mdi-delete'" class="contextMenuIcon">mdi-delete</v-icon>
          <img v-else class="contextMenuIcon" :src="option.icon"/>
          <p class="ma-0 pl-3">{{ option.title }}</p>
        </a>

        <!-- // TODO figure out how to grey out a list entry
        <a v-else class="disabled-link d-flex align-center px-4">
          <v-icon v-if="option.icon==='mdi-delete'" color="red" class="contextMenuIcon">mdi-delete</v-icon>
          <img v-else class="contextMenuIcon" :src="option.icon"/>
          <p class="ma-0 pl-3">{{ option.title }}</p>
        </a>
        -->
      </li>
    </vue-context>

    <DialogHandler
      :dialog.sync="dialog.active"
      :type.sync="dialog.type"
      :view="whakapapaView"
      :loadDescendants="loadDescendants"
      :loadKnownFamily="loadKnownFamily"
      :getRelatives="getRelatives"
      :relationshipLinks="relationshipLinks"
      @updateFocus="updateFocus($event)"
      :setSelectedProfile="setSelectedProfile"
      @change-focus="changeFocus($event)"
      @newAncestor="setFocus($event)"
      :focus="focus"
      @update-whakapapa="saveWhakapapa($event)"
      @delete-whakapapa="deleteWhakapapa"
      @refreshWhakapapa="refreshWhakapapa"
      @setFocus="setFocus($event)"
    />
  </div>
</template>

<script>
import { VueContext } from 'vue-context'

import WhakapapaShowViewCard from '@/components/whakapapa/WhakapapaShowViewCard.vue'
import WhakapapaBanner from '@/components/whakapapa/WhakapapaBanner.vue'

import Tree from '@/components/tree/Tree.vue'
import Table from '@/components/table/Table.vue'
import FeedbackButton from '@/components/button/FeedbackButton.vue'
import TableButton from '@/components/button/TableButton.vue'
import HelpButton from '@/components/button/HelpButton.vue'
import FlattenButton from '@/components/button/FlattenButton.vue'
import FilterButton from '@/components/button/FilterButton.vue'

import SearchBar from '@/components/button/SearchBar.vue'
import SearchButton from '@/components/button/SearchButton.vue'

import tree from '@/lib/tree-helpers'
import avatarHelper from '@/lib/avatar-helpers.js'
import { getRelatives } from '@/lib/person-helpers.js'
import { getWhakapapaView, saveWhakapapaView } from '@/lib/whakapapa-helpers.js'

import DialogHandler from '@/components/dialog/DialogHandler.vue'
import findSuccessor from '@/lib/find-successor'

import { mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  name: 'WhakapapaShow',
  components: {
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
      fab: false,
      overflow: 'false',
      pan: 0,
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

      relationshipLinks: new Map(), // shows relationship information between two profiles -> reference using parentId-childId as the key

      dialog: {
        active: null,
        type: null
      },
      filter: false,
      flatten: false,
      whakapapa: {
        tree: true,
        table: false
      }
    }
  },
  apollo: {
    whakapapaView () {
      return getWhakapapaView(this.$route.params.whakapapaId)
    }
  },
  computed: {
    ...mapGetters(['nestedWhakapapa', 'selectedProfile', 'whoami', 'loadingState', 'getAccessFromRecps']),
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    currentFocus: {
      get () {
        return this.focus || this.whakapapaView.focus
      },
      set (newValue) {
        this.focus = newValue
      }
    },
    canEdit () {
      return this.selectedProfile && this.selectedProfile.canEdit
    },
    canAddSibling () {
      if (!this.selectedProfile) return false

      // if adding a sibling to the focus
      return this.selectedProfile.id !== this.whakapapaView.focus
    },
    canDelete () {
      if (!this.canEdit) return false

      // not allowed to delete own profile
      if (this.selectedProfile.id === this.whoami.public.profile.id) return false
      if (this.selectedProfile.id === this.whoami.personal.profile.id) return false

      // if deleting the focus (top ancestor)
      if (this.selectedProfile.id === this.whakapapaView.focus) {
        // can only proceed if can find a clear "successor" to be new focus
        return Boolean(findSuccessor(this.selectedProfile))
      }

      return true
    },
    contextMenuOpts () {
      return [
        {
          title: 'Add Parent',
          dialog: 'new-node',
          type: 'parent',
          isPermitted: Boolean(this.selectedProfile),
          icon: require('../assets/node-parent.svg')
        },
        {
          title: 'Add Child',
          dialog: 'new-node',
          type: 'child',
          isPermitted: Boolean(this.selectedProfile),
          icon: require('../assets/node-child.svg')
        },
        {
          title: 'Add Sibling',
          dialog: 'new-node',
          type: 'sibling',
          isPermitted: this.canAddSibling,
          icon: require('../assets/node-sibling.svg')
        },
        {
          title: 'Delete Person',
          dialog: 'delete-node',
          type: null,
          isPermitted: this.canDelete,
          icon: 'mdi-delete'
        }
      ]
    },
    access () {
      // return the access based on the whakapapaView we are in...
      if (!this.whakapapaView || !this.whakapapaView.recps) return null
      return this.getAccessFromRecps(this.whakapapaView.recps)
    }
  },
  watch: {
    currentFocus: async function (newFocus) {
      if (newFocus) {
        this.setLoading(true)
        // var startTime = Date.now()

        const nestedWhakapapa = await this.loadDescendants(newFocus, '', [])
        this.addNestedWhakapapa(nestedWhakapapa)
        this.addRelationshipLinks(this.relationshipLinks)
        // var endTime = Date.now()
        // var eclipsedTime = (endTime - startTime) / 1000
        // console.log('build whakapapa time: ', eclipsedTime)
        this.setLoading(false)
      }
    },
    whakapapaView (newVal) {
      if (newVal.recps) this.setCurrentAccess(this.getAccessFromRecps(newVal.recps))
      this.addWhakapapa(newVal)
    },
    relationshipLinks (newVal) {
      this.addRelationshipLinks(newVal)
    }
  },
  methods: {
    ...mapMutations(['updateSelectedProfile', 'setCurrentAccess']),
    ...mapActions(['setLoading', 'addNestedWhakapapa', 'addWhakapapa', 'addRelationshipLinks']),
    tableOverflow (width) {
      var show = width > screen.width
      this.overflow = show
    },
    togglePan (x) {
      this.$refs.table.panAction(x)
    },
    clickedOff () {
      this.search = !this.search
    },
    isVisibleProfile (descendant) {
      if (this.whakapapaView.ignoredProfiles) { return this.whakapapaView.ignoredProfiles.indexOf(descendant.profile.id) === -1 }
    },
    updateDialog (dialog, type) {
      this.dialog.type = type
      this.dialog.active = dialog
    },
    // Used when ignoring/deleteing top ancestor on a partner line
    // AND when adding a partner ancestor update the tree to load
    setFocus (profileId) {
      this.currentFocus = profileId
    },
    // Used when adding top ancestor on a partner line & swapping between partner lines
    async changeFocus (profileId) {
      const newFocus = await this.getWhakapapaHead(profileId, 'newAmountParents')
      this.setSelectedProfile(profileId)
      this.setFocus(newFocus)
    },
    async getWhakapapaHead (profileId, type = 'temp') {
      if (this.whakapapaView.focus === profileId) return profileId

      const record = await this.getRelatives(profileId)
      if (
        !record || !record.parents || !record.parents.length ||
        this.whakapapaView.ignoredProfiles.includes(record.parents[0].profile.id)
      ) return profileId

      return this.getWhakapapaHead(record.parents[0].profile.id, type)
    },
    /*
      makes changes of a person to all their decendants
      without making calls to the db
    */
    async loadKnownFamily (loadProfile, person) {
      const { children, parents, partners, siblings, relationship } = person
      var profile = {}

      if (loadProfile) {
        profile = await this.getRelatives(person.id)
      } else {
        profile = person
      }

      // populate it with what we do know about family members
      profile = Object.assign(profile, {
        children: children || [],
        parents: parents || [],
        siblings: siblings || [],
        partners: partners || [],
        relationship: relationship
      })

      if (!profile.relationship && profile.parents.length) profile.relationship = this.relationshipLinks[profile.parents[0].id + '-' + profile.id]

      if (!profile.children || profile.children.length === 0) return profile

      // // change my profile in all of my children
      profile.children = await Promise.all(profile.children.map(async child => {
        if (!child.parents) return child
        child.parents = child.parents.map(parent => {
          if (parent.id === person.id) {
            return profile
          }
          return parent
        })

        return child
      }))

      return profile
    },

    async getRelatives (id) {
      const result = await getRelatives(id, this.$apollo)
      if (!result) return

      if (result.id === this.currentFocus && result.parents.length) {
        // this looks like we are sometimes wiping parents? why?
        // if it wasn't for this piece of code we would not need to pass this function into Tree, ...
        result.parents = []
      }
      return result
    },

    async loadDescendants (profileId, path, temp) {
      // calls person.fetchPerson which gets info about this person from the db
      var person = await this.getRelatives(profileId)

      // if (temp[profileId]) console.log('profile exists: ', profileId)
      // else temp[profileId] = profileId

      // make sure every person has a partners and siblings array
      person.partners = []
      person.siblings = []

      person.path = path

      // filter out ignored profiles
      person.children = person.children.filter(this.isVisibleProfile)
      person.parents = person.parents.filter(this.isVisibleProfile)

      // for each of my children
      person.children = await Promise.all(person.children.map(async (child, i) => {
        var childPath = `children[${i}]`
        if (path) childPath = person.path + '.' + childPath

        // load their descendants
        const childProfile = await this.loadDescendants(child.profile.id, childPath, temp)
        person = tree.getPartners(person, childProfile)

        const r = tree.getRelationship(person, childProfile, child)
        this.relationshipLinks.set(r.index, r.attrs)

        return childProfile
      }))

      person.children = person.children.sort((a, b) => {
        return a.birthOrder - b.birthOrder
      })

      person.parents = await Promise.all(person.parents.map(async parent => {
        // load their profile
        const parentProfile = await this.getRelatives(parent.profile.id)

        // look at their children
        person = tree.getSiblings(parentProfile, person)

        const r = tree.getRelationship(parentProfile, person, parent)
        this.relationshipLinks.set(r.index, r.attrs)

        return parentProfile
      }))

      person.partners = await Promise.all(person.partners.map(async (partner, i) => {
        var partnerPath = `partners[${i}]`
        if (path) partnerPath = person.path + '.' + partnerPath
        partner.path = partnerPath

        partner.children = partner.children.map(child => {
          const exists = person.children.find(d => {
            var id = (child.profile) ? child.profile.id : child.id
            return d.id === id
          })
          if (exists) return exists
          // TODO: doesnt save this relationship
          return child.profile
        })

        partner.parents = partner.parents.map(d => {
          // TODO: doesnt save this relationship
          return d.profile
        })

        partner.partners = [person]
        partner.siblings = []

        return partner
      }))

      if (person.parents.length > 0) {
        person.relationship = this.relationshipLinks.get(person.parents[0].id + '-' + person.id)
      }
      if (this.selectedProfile && this.selectedProfile.id === person.id) this.updateSelectedProfile(person)
      return person
    },

    // contextMenu //////////////////////////
    // TODO - extract all this
    openContextMenu ({ event, profile }) {
      this.setSelectedProfile(profile)
      if (this.dialog.view) {
        this.toggleView()
      }
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
      await this.saveWhakapapa({ focus })
    },
    async setSelectedProfile (profile) {
      if (profile === null) {
        this.updateSelectedProfile({})
        return
      }
      // check the type of profile we received
      if (typeof profile === 'object') {
        profile = await this.loadKnownFamily(true, profile)
        if (profile.parents.length) {
          // find parent to get any changes to siblings
          var person = await tree.find(this.nestedWhakapapa, profile.parents[0].id)
          if (!person) {
            this.updateSelectedProfile(profile)
            return
          }
          var updatedProfile = tree.getSiblings(person, profile)
          this.updateSelectedProfile(updatedProfile)
        } else this.updateSelectedProfile(profile)
      } else if (typeof profile === 'string') {
        // need to find the profile in this whakapapa
        var profileFound = await tree.find(this.nestedWhakapapa, profile)
        if (!profileFound) {
          // lets load descendants of them instead
          let partner = await this.loadDescendants(profile, '', [])
          partner.isPartner = true
          console.warn('could potentially be loading a large amount of data')
          this.updateSelectedProfile(partner)
          return
        }
        if (profileFound.parents.length) {
          // find parent to get any changes to siblings
          var parent = await tree.find(this.nestedWhakapapa, profileFound.parents[0].id)
          // if parent not found is becuase that parent is not in this nestedWhakapapa
          if (!parent) {
            this.updateSelectedProfile(profileFound)
            return
          }
          var newUpdatedProfile = tree.getSiblings(parent, profileFound)
          this.updateSelectedProfile(newUpdatedProfile)
        } else this.updateSelectedProfile(profileFound)
      } else {
        this.updateSelectedProfile({})
      }
    },
    async saveWhakapapa (input) {
      input = {
        id: this.whakapapaView.id,
        ...input
      }

      try {
        const res = await this.$apollo.mutate(saveWhakapapaView(input))
        if (res.errors) {
          console.error('failed to save whakapapa', res.errors)
          return
        }
        // refresh the current whakapapa
        await this.refreshWhakapapa()
        return res.data.saveWhakapapaView
      } catch (e) {
        console.error('something went wrong while trying to save the whakapapa', e)
      }
    },
    async refreshWhakapapa () {
      await this.$apollo.queries.whakapapaView.refresh()
    },
    async deleteWhakapapa () {
      var input = {
        tombstone: { date: new Date() }
      }

      await this.saveWhakapapa(input)

      const [newPath] = this.$route.fullPath.split('whakapapa/')
      this.$router.push({ path: newPath + 'whakapapa' }).catch(() => {})
    },
    getImage () {
      return avatarHelper.defaultImage(this.aliveInterval, this.gender)
    }
  },
  destroyed () {
    // reset whakapapa and relationships when leaving the tree
    this.addNestedWhakapapa([])
    this.addRelationshipLinks([])
  }
}

</script>
<style>
.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
    transform: rotate(0);
}
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~vue-context/dist/css/vue-context.css";
#whakapapa-show {
  &>.container {
    position: relative;
    max-height:98vh;

    &>.header {
      position: absolute;
      top: 70px;
      left: 22px;
      /* right: 160px; */
      width: 30%;
      .col {
          padding-top: 0;
          padding-bottom: 0;
      }
    }
    &>.select {
      position: fixed;
      top: 80px;
      right: 110px;
      .col {
          padding-top: 0;
          padding-bottom: 0;
      }
    }
    &>.navigate {
      position: fixed;
      top: 130px;
      right: 110px;
    }
    &>.navigateMobile {
      position: fixed;
      top: 130px;
      right: 50px;
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

.tree {
  max-height: calc(100vh)
}

.mobile-tree {
  position:absolute;
  height: calc(100vh - 43px);
  margin-top: -68px;
}

#create .v-speed-dial {
  position: absolute;
}

#create .v-btn--floating {
  position: relative;
}

.whakapapa-table {
  overflow: auto;
  width: 100%;
}

</style>
